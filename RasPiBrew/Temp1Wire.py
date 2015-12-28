from subprocess import Popen, PIPE, call
import os

<<<<<<< HEAD
class Temp1Wire:
    numSensor = 0
=======
numSensor = 0

class Temp1Wire:
>>>>>>> 948529d... Factoring out 1W temp sensor to a reusable module
    def __init__(self, tempSensorId):
        self.tempSensorId = tempSensorId
        self.sensorNum = Temp1Wire.numSensor
        Temp1Wire.numSensor += 1
        # Raspbian build in January 2015 (kernel 3.18.8 and higher) has changed the device tree.
        oldOneWireDir = "/sys/bus/w1/devices/w1_bus_master1/"
        newOneWireDir = "/sys/bus/w1/devices/"
        if os.path.exists(oldOneWireDir):
            self.oneWireDir = oldOneWireDir 
        else:
            self.oneWireDir = newOneWireDir
        print("Constructing 1W sensor %s"%(tempSensorId))

    def readTempC(self):
        #pipe = Popen(["cat","/sys/bus/w1/devices/" + tempSensorId + "/w1_slave"], stdout=PIPE)
        pipe = Popen(["cat", self.oneWireDir + self.tempSensorId + "/w1_slave"], stdout=PIPE)

        result = pipe.communicate()[0]
        if (result.split('\n')[0].split(' ')[11] == "YES"):
          temp_C = float(result.split("=")[-1])/1000 # temp in Celcius
        else:
          temp_C = -99 #bad temp reading
          
        return temp_C
