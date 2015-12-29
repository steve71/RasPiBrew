class Display:
    def showTemperature(self, temp_str):
        pass
    def showDutyCycle(self, duty_cycle):
        pass
    def showAutoMode(self, set_point):
        pass
    def showBoilMode(self):
        pass
    def showManualMode(self):
        pass

class LCD(Display):
    def __init__(self, tempUnits):
        self.tempUnits = tempUnits
        ser = serial.Serial("/dev/ttyAMA0", 9600)
        ser.write("?BFF")
        time.sleep(.1) #wait 100msec
        ser.write("?f?a")
        ser.write("?y0?x00PID off      ")
        ser.write("?y1?x00HLT:")
        ser.write("?y3?x00Heat: off      ")
        ser.write("?D70609090600000000") #define degree symbol
        time.sleep(.1) #wait 100msec

    def showTemperature(self, temp_str):
        #write to LCD
        ser.write("?y1?x05")
        ser.write(temp_str)
        ser.write("?7") #degree
        time.sleep(.005) #wait 5msec
        if (tempUnits == 'F'):
            ser.write("F   ")
        else:
            ser.write("C   ")

    def showDutyCycle(self, duty_cycle):
        #write to LCD
        ser.write("?y2?x00Duty: ")
        ser.write("%3.1f" % duty_cycle)
        ser.write("%     ")

    def showAutoMode(self, set_point):
        ser.write("?y0?x00Auto Mode     ")
        ser.write("?y1?x00HLT:")
        ser.write("?y3?x00Set To: ")
        ser.write("%3.1f" % set_point)
        ser.write("?7") #degree
        time.sleep(.005) #wait 5msec
        ser.write("F   ")

    def showBoilMode(self):
        ser.write("?y0?x00Boil Mode     ")
        ser.write("?y1?x00BK: ")
        ser.write("?y3?x00Heat: on       ")

    def showManualMode(self):
        ser.write("?y0?x00Manual Mode     ")
        ser.write("?y1?x00BK: ")
        ser.write("?y3?x00Heat: on       ")

    def showOffMode(self):
        ser.write("?y0?x00PID off      ")
        ser.write("?y1?x00HLT:")
        ser.write("?y3?x00Heat: off      ")

class NoDisplay(Display):
    def __init__(self):
        pass
