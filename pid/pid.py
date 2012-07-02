from ctypes import *

class PID_PARAMS(Structure):
	_fields_=[("controllerGain", c_double),
		("timeConstI", c_double),
		("timeConstD", c_double),
		("sampleTime", c_double),
		("timeConstLpf", c_double),
		("k0", c_double),
		("k1", c_double),
		("k2", c_double),
		("k3", c_double),
		("lpf1", c_double),
		("lpf2", c_double),
		("ts_ticks", c_int),
		("pid_model", c_int),
		("pp", c_double),
		("pi", c_double),
		("pd", c_double)]

class PID(object):
	def __init__(self, sample_time, kf, ti, td):
		self.libpid = CDLL("./pid/libpid_reg.so")
		self.p_pid_params = pointer(PID_PARAMS(kf, ti, td, sample_time, 0,0,0,0,0, \
					0,0,0,4,0,0,0))
		#print self.p_pid_params.contents.lpf1
		self.libpid.init_pid4.argtypes = [POINTER(PID_PARAMS)]
		self.libpid.init_pid4(self.p_pid_params)
		self.output = 0
		#print self.p_pid_params.contents.lpf1
								
	def calcPID(self, temp, setpoint, start):
		if start:
			Start = 1
		else:
			Start = 0
		p_output = pointer(c_double(self.output))
		#print p_output.contents, p_output.contents.value
		self.libpid.pid_reg4.argtypes = [c_double, POINTER(c_double), c_double, POINTER(PID_PARAMS), c_int]
		self.libpid.pid_reg4(c_double(temp), p_output, c_double(setpoint), self.p_pid_params, c_int(Start))
		return p_output.contents.value
	
if __name__=="__main__":

	sampleTime = 2
	
	pid = PID(sampleTime)

	temp = 80
	setpoint = 100
	start = True

	print pid.calcPID(temp, setpoint, start)
	print pid.calcPID(temp, setpoint, start)
	print pid.calcPID(temp, setpoint, start)
	
