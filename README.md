# Raspberry Pi Temperature Controller

## Control a Water Heater Wirelessly over a Web Interface

This program will control an electric heating element in a vessel to set temperatures and regulate boil.  All status included temperature is sent back wirelessly approx. every second.  The duty cycle and temperature is plotted in real time.  A Type C PID algorithm has been successfully implemented to automatically control the heating element when the desired temperature is set.   

RasPiBrew Webpage:
[http://raspibrew.com](http://raspibrew.com)  
Hardware and Software Setup Information:  
[http://raspibrew.com/setup/](http://raspibrew.com/setup/)  

## Web Interface in Firefox Browser

<img src="https://github.com/steve71/RasPiBrew/raw/master/img/PID_Tuning.png" alt="" width="954 height="476.5" /> 

----------

## Setting to 120 deg F

![](https://github.com/steve71/RasPiBrew/raw/master/img/PID_Temp_Control.png)  
The temp plot shows temperature in degrees F over time in seconds.  
The heat plot shows duty cycle percentage over time in seconds.

## Hardware

A $35 credit card sized Raspberry Pi computer is an inexpensive and very expandable solution to controlling the water temperature.  Here it is used for temperature control of one vessel.  Used in combination with a jeelabs thermo plug (1-wire and control relay), 1-wire temperature sensors and a usb wifi dongle, a wirelessly controlled temperature controller can be developed.  The Raspberry Pi can run a web server to communicate the data to a browser or application on a computer or smartphone.

Electronics used to test: Raspberry Pi, Raspberry Pi Plate kit from Adafruit, Jeelabs Thermo Plug circuit board (1wire and GPIO), Jeelabs Output Plug (I2C) (Optional to drive more relays. This requires software modification.), 1-wire DS18B20 digital thermometer, 20x4 LCD and LCD117 kit (serial interface), 4.7k resistor, 1k resistor, 1N4001 diode, and 2N4401 transistor.  For wireless an Edimax EW-7811UN dongle is used.

Information on Raspberry Pi low-level peripherals:  
[http://elinux.org/RPi_Low-level_peripherals](http://elinux.org/RPi_Low-level_peripherals)


## Software

The language for the server side software is Python for rapid development.  The web server/framework is web.py.  Multiple processes connected with pipes to communicate between them are used.  For instance, one process can only get the temperature while another turns a heating element on and off.  A third parent temp control process can control the heating process with information from the temp process and relay the information back to the web server.

On the client side jQuery and various plugins can be used to display data such as line charts and gauges. Mouse overs on the temperature plot will show the time and temp for the individual points.  It is currently working in a Firefox Browser.   

jQuery and two jQuery plugins (jsGauge and Flot) are used in the client:  
[http://jquery.com](http://jquery.com "jQuery")  
[http://code.google.com/p/jsgauge/](http://code.google.com/p/jsgauge/ "jsgauge")  
[http://code.google.com/p/flot/](http://code.google.com/p/flot/ "flot")  

The PID algorithm was translated from C code to Python.  The C code was from "PID Controller Calculus with full C source source code" by Emile van de Logt
An explanation on how to tune it is from the following web site:  
[http://www.vandelogt.nl/htm/regelen_pid_uk.htm](http://www.vandelogt.nl/htm/regelen_pid_uk.htm)  

The PID can be tuned very simply via the Ziegler-Nichols open loop method.  Just follow the directions in the controller interface screen, highlight the sloped line in the temperature plot and the parameters are automatically calculated.  After tuning with the Ziegler-Nichols method the parameters still needed adjustment because there was an overshoot of about 2 degrees in my system. I did not want the temperature to go past the setpoint since it takes a long time to come back down. Therefore, the parameters were adjusted to eliminate the overshoot.  For this particular system the Ti term was more than doubled and the Td parameter was set to about a quarter of the open loop calculated value.  Also a simple moving average was used on the temperature data that was fed to the PID controller to help improve performance.  Tuning the parameters via the Integral of Time weighted Absolute Error (ITAE-Load) would provide the best results as described on van de Logt's website above.


