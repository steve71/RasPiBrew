#
# Copyright (c) 2012 Stephen P. Smith
#
# Permission is hereby granted, free of charge, to any person obtaining 
# a copy of this software and associated documentation files 
# (the "Software"), to deal in the Software without restriction, 
# including without limitation the rights to use, copy, modify, 
# merge, publish, distribute, sublicense, and/or sell copies of the Software, 
# and to permit persons to whom the Software is furnished to do so, 
# subject to the following conditions:

# The above copyright notice and this permission notice shall be included 
# in all copies or substantial portions of the Software.

# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS 
# OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, 
# WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR 
# IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


from multiprocessing import Process, Pipe, current_process
from subprocess import Popen, PIPE, call
from datetime import datetime
import web, time, random, json, serial
from smbus import SMBus
#from pid import pid as PIDController
from pid import pidpy as PIDController


class param:
    mode = "off"
    cycle_time = 2.0
    duty_cycle = 0.0
    set_point = 0.0
    k_param = 43.78
    i_param = 140
    d_param = 5


def add_global_hook(parent_conn):
    
    g = web.storage({"parent_conn": parent_conn})
    def _wrapper(handler):
        web.ctx.globals = g
        return handler()
    return _wrapper
            

class raspibrew: 
    def __init__(self):
                
        self.mode = param.mode
        self.cycle_time = param.cycle_time
        self.duty_cycle = param.duty_cycle
        self.set_point = param.set_point
        self.k_param = param.k_param
        self.i_param = param.i_param
        self.d_param = param.d_param
        
        
    def GET(self):
       
        return render.raspibrew(self.mode, self.set_point, self.duty_cycle, self.cycle_time, \
                                self.k_param,self.i_param,self.d_param)
        
    def POST(self):
        data = web.data()
        #print data
        datalist = data.split("&")
        for item in datalist:
            datalistkey = item.split("=")
            if datalistkey[0] == "mode":
                self.mode = datalistkey[1]
            if datalistkey[0] == "setpoint":
                self.set_point = float(datalistkey[1])
            if datalistkey[0] == "dutycycle":
                self.duty_cycle = float(datalistkey[1])
            if datalistkey[0] == "cycletime":
                self.cycle_time = float(datalistkey[1])
            if datalistkey[0] == "k":
                self.k_param = float(datalistkey[1])
            if datalistkey[0] == "i":
                self.i_param = float(datalistkey[1])
            if datalistkey[0] == "d":
                self.d_param = float(datalistkey[1])
         
        web.ctx.globals.parent_conn.send([self.mode, self.cycle_time, self.duty_cycle, self.set_point, \
                              self.k_param, self.i_param, self.d_param])  
             
 
def getrandProc(conn):
    p = current_process()
    print 'Starting:', p.name, p.pid
    while (True):
        #t = time.time()
        num = randomnum()
        #elapsed = time.time() - t
        time.sleep(.5) 
        #print num
        conn.send(num)

        
def gettempProc(conn):
    p = current_process()
    print 'Starting:', p.name, p.pid
    while (True):
        t = time.time()
        time.sleep(.5) #.1+~.83 = ~1.33 seconds
        num = tempdata()
        elapsed = "%.2f" % (time.time() - t)
        conn.send([num, elapsed])
        

def getonofftime(cycle_time, duty_cycle):
    duty = duty_cycle/100.0
    on_time = cycle_time*(duty)
    off_time = cycle_time*(1.0-duty)   
    return [on_time, off_time]
        
def heatProctest(cycle_time, duty_cycle, conn):
    #p = current_process()
    #print 'Starting:', p.name, p.pid
    while (True):
        if (conn.poll()):
            cycle_time, duty_cycle = conn.recv()
            
        on_time, off_time = getonofftime(cycle_time, duty_cycle)
        #print on_time
        # led on
        time.sleep(on_time)
        #print off_time
        # led off
        time.sleep(off_time)
        conn.send([cycle_time, duty_cycle]) #shows its alive
        
        
def heatProc(cycle_time, duty_cycle, conn):
    p = current_process()
    print 'Starting:', p.name, p.pid
    bus = SMBus(0)
    bus.write_byte_data(0x26,0x00,0x00) #set I/0 to write
    while (True):
        while (conn.poll()): #get last
            cycle_time, duty_cycle = conn.recv()
        conn.send([cycle_time, duty_cycle])  
        if duty_cycle == 0:
            bus.write_byte_data(0x26,0x09,0x00)
            time.sleep(cycle_time)
        elif duty_cycle == 100:
            bus.write_byte_data(0x26,0x09,0x01)
            time.sleep(cycle_time)
        else:
            on_time, off_time = getonofftime(cycle_time, duty_cycle)
            bus.write_byte_data(0x26,0x09,0x01)
            time.sleep(on_time)
            bus.write_byte_data(0x26,0x09,0x00)
            time.sleep(off_time)
        
        #y = datetime.now()
        #time_sec = y.second + y.microsecond/1000000.0
        #print "%s Thread time (sec) after LED off: %.2f" % (self.getName(), time_sec)

def tempControlProcTest(mode, cycle_time, duty_cycle, set_point, k_param, i_param, d_param, conn):
    
        p = current_process()
        print 'Starting:', p.name, p.pid
        parent_conn_temp, child_conn_temp = Pipe()            
        ptemp = Process(name = "getrandProc", target=getrandProc, args=(child_conn_temp,))
        #ptemp.daemon = True
        ptemp.start()   
        parent_conn_heat, child_conn_heat = Pipe()           
        pheat = Process(name = "heatProctest", target=heatProctest, args=(cycle_time, duty_cycle, child_conn_heat))
        #pheat.daemon = True
        pheat.start()  
        
        while (True):
            if parent_conn_temp.poll():
                randnum = parent_conn_temp.recv() #non blocking receive
                conn.send([randnum, mode, cycle_time, duty_cycle, set_point, k_param, i_param, d_param])
            if parent_conn_heat.poll():
                cycle_time, duty_cycle = parent_conn_heat.recv()
                #duty_cycle = on_time/offtime*100.0
                #cycle_time = on_time + off_time
            if conn.poll():
                mode, cycle_time, duty_cycle, set_point, k_param, i_param, d_param = conn.recv()
                #conn.send([mode, cycle_time, duty_cycle])
                #if mode == "manual": 
                parent_conn_heat.send([cycle_time, duty_cycle])
            
#controls 

def tempControlProc(mode, cycle_time, duty_cycle, set_point, k_param, i_param, d_param, conn):
            
        p = current_process()
        print 'Starting:', p.name, p.pid
        parent_conn_temp, child_conn_temp = Pipe()            
        ptemp = Process(name = "gettempProc", target=gettempProc, args=(child_conn_temp,))
        ptemp.daemon = True
        ptemp.start()   
        parent_conn_heat, child_conn_heat = Pipe()           
        pheat = Process(name = "heatProc", target=heatProc, args=(cycle_time, duty_cycle, child_conn_heat))
        pheat.daemon = True
        pheat.start() 
        
        #initialize LCD
        ser = serial.Serial("/dev/ttyAMA0", 9600)
        ser.write("?BFF")
        ser.write("?f?a")
        ser.write("?y0?x00PID off      ")
        ser.write("?y1?x00HLT:")
        ser.write("?y3?x00Heat: off      ")
        
        temp_F_ma_list = []
        temp_F_ma = 0.0
        
        while (True):
            readytemp = False
            while parent_conn_temp.poll():
                temp_C, elapsed = parent_conn_temp.recv() #non blocking receive    
                temp_F = (9.0/5.0)*temp_C + 32
                
                temp_F_ma_list.append(temp_F) 
                
                #print temp_F_ma_list
                #smooth temp data
                #
                if (len(temp_F_ma_list) == 1):
                    temp_F_ma = temp_F_ma_list[0]
                elif (len(temp_F_ma_list) == 2):
                    temp_F_ma = (temp_F_ma_list[0] + temp_F_ma_list[1]) / 2.0
                elif (len(temp_F_ma_list) == 3):
                    temp_F_ma = (temp_F_ma_list[0] + temp_F_ma_list[1] + temp_F_ma_list[2]) / 3.0
                elif (len(temp_F_ma_list) == 4):
                    temp_F_ma = (temp_F_ma_list[0] + temp_F_ma_list[1] + temp_F_ma_list[2] + temp_F_ma_list[3]) / 4.0
                else:    
                    temp_F_ma = (temp_F_ma_list[0] + temp_F_ma_list[1] + temp_F_ma_list[2] + temp_F_ma_list[3] + \
                                                                                            temp_F_ma_list[4]) / 5.0
                    temp_F_ma_list.pop(0) #remove oldest element in list
                    #print "Temp F MA %.2f" % temp_F_ma
                
                temp_C_str = "%3.2f" % temp_C
                temp_F_str = "%3.2f" % temp_F
                ser.write("?y1?x05")
                ser.write(temp_F_str)
                #ser.write("?y1?x10")
                ser.write("?D70609090600000000") #degree symbol
                ser.write("?7F   ") #degree F
                readytemp = True
            if readytemp == True:
                if mode == "auto":
                    #calculate PID every cycle - alwyas get latest temp
                    #duty_cycle = pid.calcPID(float(temp), set_point, True)
                    #set_point_C = (5.0/9.0)*(set_point - 32)
                    print "Temp F MA %.2f" % temp_F_ma
                    duty_cycle = pid.calcPID_reg4(temp_F_ma, set_point, True)
                    #send to heat process every cycle
                    parent_conn_heat.send([cycle_time, duty_cycle])   
                conn.send([temp_F_str, elapsed, mode, cycle_time, duty_cycle, set_point, k_param, i_param, d_param]) #GET request
                readytemp == False   
                
            while parent_conn_heat.poll(): #non blocking receive
                cycle_time, duty_cycle = parent_conn_heat.recv()
                ser.write("?y2?x00Duty: ")
                ser.write("%3.1f" % duty_cycle)
                ser.write("%     ")    
                     
            readyPOST = False
            while conn.poll(): #POST settings
                mode, cycle_time, duty_cycle_temp, set_point, k_param, i_param, d_param = conn.recv()
                readyPOST = True
            if readyPOST == True:
                if mode == "auto":
                    ser.write("?y0?x00Auto Mode     ")
                    ser.write("?y1?x00HLT:")
                    ser.write("?y3?x00Set To: ")
                    ser.write("%3.1f" % set_point)
                    ser.write("?D70609090600000000") #degree symbol
                    ser.write("?7F   ") #degree F
                    print "auto selected"
                    #pid = PIDController.PID(cycle_time, k_param, i_param, d_param) #init pid
                    #duty_cycle = pid.calcPID(float(temp), set_point, True)
                    pid = PIDController.pidpy(cycle_time, k_param, i_param, d_param) #init pid
                    #set_point_C = (5.0/9.0)*(set_point - 32)
                    duty_cycle = pid.calcPID_reg4(temp_F_ma, set_point, True)
                    parent_conn_heat.send([cycle_time, duty_cycle])  
                if mode == "manual": 
                    ser.write("?y0?x00Manual Mode     ")
                    ser.write("?y1?x00BK: ")
                    ser.write("?y3?x00Heat: on       ")
                    print "manual selected"
                    duty_cycle = duty_cycle_temp
                    parent_conn_heat.send([cycle_time, duty_cycle])    
                if mode == "off":
                    ser.write("?y0?x00PID off      ")
                    ser.write("?y1?x00HLT:")
                    ser.write("?y3?x00Heat: off      ")
                    print "off selected"
                    duty_cycle = 0
                    parent_conn_heat.send([cycle_time, duty_cycle])
                readyPOST = False
            time.sleep(.01)
                    
class getrand:
    def __init__(self):
        pass
    def GET(self):
        #global parent_conn  
        while parent_conn.poll(): #get last
            randnum, mode, cycle_time, duty_cycle, set_point, k_param, i_param, d_param = parent_conn.recv()
        #controlData = parent_conn.recv()
        out = json.dumps({"temp" : randnum,
                          "mode" : mode,
                    "cycle_time" : cycle_time,
                    "duty_cycle" : duty_cycle,
                     "set_point" : set_point,
                       "k_param" : k_param,
                       "i_param" : i_param,
                       "d_param" : d_param})  
        return out
        #return randomnum()
        
    def POST(self):
        pass

class getstatus:
    
    def __init__(self):
        pass    

    def GET(self):
        #blocking receive
 
        temp, elapsed, mode, cycle_time, duty_cycle, set_point, k_param, i_param, d_param = web.ctx.globals.parent_conn.recv() 
        while web.ctx.globals.parent_conn.poll(): #get last
            temp, elapsed, mode, cycle_time, duty_cycle, set_point, k_param, i_param, d_param = web.ctx.globals.parent_conn.recv()
            
        out = json.dumps({"temp" : temp,
                       "elapsed" : elapsed,
                          "mode" : mode,
                    "cycle_time" : cycle_time,
                    "duty_cycle" : duty_cycle,
                     "set_point" : set_point,
                       "k_param" : k_param,
                       "i_param" : i_param,
                       "d_param" : d_param})  
        return out
        #return tempdata()
       
    def POST(self):
        pass
    
def randomnum():
    time.sleep(.5)
    return random.randint(50,220)

def tempdata():
    #change 28-000002b2fa07 to your own temp sensor id
    #pipe = Popen(["cat","/sys/bus/w1/devices/w1_bus_master1/28-000002b2fa07/w1_slave"], stdout=PIPE)
    pipe = Popen(["cat","/sys/bus/w1/devices/w1_bus_master1/28-0000037eb5c0/w1_slave"], stdout=PIPE)
    result = pipe.communicate()[0]
    result_list = result.split("=")
    temp_C = float(result_list[-1])/1000 # temp in Celcius
    #temp_F = (9.0/5.0)*temp_C + 32
    #return "%3.2f" % temp_C
    return temp_C

if __name__ == '__main__':
     
    call(["modprobe", "w1-gpio"])
    call(["modprobe", "i2c-dev"])
    
    urls = ("/", "raspibrew",
        "/getrand", "getrand",
        "/getstatus", "getstatus")

    render = web.template.render("/var/www/templates/")

    app = web.application(urls, globals()) 
    
    parent_conn, child_conn = Pipe()       
    p = Process(name = "tempControlProc", target=tempControlProc, args=(param.mode, param.cycle_time, param.duty_cycle, \
                                                              param.set_point, param.k_param, param.i_param, param.d_param, \
                                                              child_conn))
    p.start()
    
    app.add_processor(add_global_hook(parent_conn))
     
    app.run()


