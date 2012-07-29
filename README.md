# Raspberry Pi Temperature Controller

## Control a Water Heater Wirelessly over a Web Interface

This program will control an electric heating element in a vessel to set temperatures and regulate boil.  All status included temperature is sent back wirelessly approx. every second.  The duty cycle and temperature is plotted in real time.  A Type C PID algorithm has been successfully implemented to automatically control the heating element when the desired temperature is set.   

## Web Interface in Firefox Browser

<img src="https://github.com/steve71/RasPiBrew/raw/master/img/PID_Tuning.png" alt="" width="954 height="476.5" /> 

----------

## After Setting the Temperature Controller to 150 deg F:

![](https://github.com/steve71/RasPiBrew/raw/master/img/PID_Temp_Control.png)  
The temp plot shows temperature in degrees F over time in seconds.  
The heat plot shows duty cycle percentage over time in seconds.

## Hardware

A $35 credit card sized raspberry pi computer is an inexpensive and very expandable solution to controlling a brewery.  Here it is only used for temperature control of one vessel.  Used in combination with a jeelabs i2c output plug to control relays, 1-wire temperature sensors and a cheap usb wifi dongle a wirelessly controlled temperature controller can be developed.  The Raspberry Pi can run a web server to communicate the data to a browser or application on a computer or smartphone.

Electronics used to test: Raspberry Pi, Raspberry Pi Plate kit from Adafruit, Jeelabs Output Plug (I2C), 1-wire DS18B20 digital thermometer, 20 x 4 LCD and LCD117 Kit (serial interface), 4.7k resistor, 1k resistor and an LED.  The output plug directly controls a solid state relay (ssr) which connects to a heating element.  For wireless a Belkin USB wifi dongle is used.

<img src="https://github.com/steve71/RasPiBrew/raw/master/img/raspibrew.jpg" alt="" width="954 height="476.5" /> 

Information on Raspberry Pi low-level peripherals:  
[http://elinux.org/RPi_Low-level_peripherals](http://elinux.org/RPi_Low-level_peripherals)

<img src="https://github.com/steve71/RasPiBrew/raw/master/img/TempController.jpg" alt="" width="470 height="238" />

## Software

The language for the server side software is Python for rapid development.  The web server/framework is web.py.  Multiple processes connected with pipes to communicate between them are used.  For instance, one process can only get the temperature while another turns a heating element on and off.  A third parent temp control process can control the heating process with information from the temp process and relay the information back to the web server.

On the client side jQuery and various plugins can be used to display data such as line charts and gauges. It is currently working in a Firefox Browser.   

jQuery and two jQuery plugins (jsGauge and FLot) are used in the client:  

[http://jquery.com](http://jquery.com "jQuery")  
[http://code.google.com/p/jsgauge/](http://code.google.com/p/jsgauge/ "jsgauge")  
[http://code.google.com/p/flot/](http://code.google.com/p/flot/ "flot")  

The PID algorithm was translated from C code to Python.  The C code was from "PID Controller Calculus with full C source source code" by Emile van de Logt
An explanation on how to tune it is from the following web site:  
[http://www.vandelogt.nl/htm/regelen_pid_uk.htm](http://www.vandelogt.nl/htm/regelen_pid_uk.htm)  

The PID can be tuned very simply via the Ziegler-Nichols open loop method.  Just follow the directions in the controller interface screen, highlight the line in the temperature plot and the parameters are automatically calculated.  (Also, mouse overs on the temperature plot will show the time and temp for the individual points.) The parameters after tuning with the Ziegler-Nichols method still needed adjustment for it to work well because there was an overshoot of about 2 degrees in my system. I did not want the temperature to go past the setpoint and adjusted the parameters to eliminate the overshoot.  The ITAE method would provide the best results. 


