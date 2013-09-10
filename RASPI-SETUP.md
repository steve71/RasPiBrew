# Setting up the Raspberry Pi

## Load Operating System onto SDCard

Download the raspberry pi operating system:
[http://www.raspberrypi.org/downloads](http://www.raspberrypi.org/downloads "Raspberry Pi Operating System")

Use Win32DiskImager to install onto SDCARD:  
[http://www.softpedia.com/get/CD-DVD-Tools/Data-CD-DVD-Burning/Win32-Disk-Imager.shtml](http://www.softpedia.com/get/CD-DVD-Tools/Data-CD-DVD-Burning/Win32-Disk-Imager.shtml "Win32DiskImager")

In terminal type:	  
	
	sudo apt-get update		
	sudo apt-get upgrade

## Beginner's Guide 

Follow the beginners guide to get up and running:  
[http://elinux.org/RPi_Beginners](http://elinux.org/RPi_Beginners)

Run `sudo setupcon` once manually after the keyboard is setup otherwise you may have long boot times.

## Wireless Setup

Lookup Compatible USB wifi devices and install the drivers:  
[http://elinux.org/RPi_VerifiedPeripherals#USB_WiFi_Adapters](http://elinux.org/RPi_VerifiedPeripherals#USB_WiFi_Adapters)

To set up a static ip address use the following in /etc/network/interfaces:
	
	auto lo

	iface lo inet loopback
	iface eth0 inet static

	auto wlan0
	iface wlan0 inet static
	address 192.168.1.103
	netmask 255.255.255.0
	gateway 192.168.1.1
	wireless-essid linksys

In this example the static IP address is 192.168.1.103 and the gateway is 192.168.1.1.  
Replace `linksys` with the name of your router and add

	wpa-ssid ssid
	wpa-psk wireless_key_passphrase 

with the correct ssid and wireless key passphrase.

Tutorial on setting up a static IP address:          
[http://www.penguintutor.com/blog/viewblog.php?blog=6306](http://www.penguintutor.com/blog/viewblog.php?blog=6306)          
Tutorial on setting up a Belkin USB wifi adapter:  
[http://www.penguintutor.com/blog/viewblog.php?blog=6281](http://www.penguintutor.com/blog/viewblog.php?blog=6281)  
Tutorial on setting up wifi device on linux:  
[https://help.ubuntu.com/community/WifiDocs/WiFiHowTo](https://help.ubuntu.com/community/WifiDocs/WiFiHowTo)

## Installation 

**Hardware**:  
An Adafruit Pi Plate Kit is used but there are many other breakout boards to choose from.  
[http://www.adafruit.com/products/801](http://www.adafruit.com/products/801)  

The Jeelabs Thermo Plug is used in this project. 
[http://moderndevice.com/product/jeelabs-thermo-plug/](http://moderndevice.com/product/jeelabs-thermo-plug/)  
Just the printed circuit board is needed and solder:
	
	4.7k resistor
	1k resistor
	1N4001 Diode
	2N4401 Transister

Solder headers and connect it together using wire jumpers according to the following schematic:

     ---------      ------- 
    | 1-Wire  |    | Relay |
    | Sensor  |    |       | 
    | + - GND |    |  + -  |
     ---------      -------
      | |  |          | |           (Optional SSR Connections)
      ---------------------          -----------   ---------
     | Jeelabs Thermo Plug |        |  Relay 2 |  | Relay 3 | ...
     | PWR +3V GND AIO DIO |        |  +  -    |  |  +  -   |
      ---------------------          ----------    ---------     
	    |   |   |   |   |             5V  |         5V  | 
      ------------------------            |             |
     | 5V  5V  GND  P4 P17    |     ---------------------------
     |                     5V |---| VCC   P0            P1 ... |
     |  Raspberry Pi/      GND|---| GND   Optional             |
     |  Adafruit Plate kit SDA|---| DIO   Jeelabs Output Plug  | 
     |                     SCL|---| AI0                        |
     |      5V GND TX         |    ----------------------------
      ------------------------
             |  |   |
          --------------   
         | 20x4 LCD and |
         | LCD117 kit   |
          --------------
          

Note: The DS18B20 temp sensor looks to be 5V tolerant [http://datasheets.maximintegrated.com/en/ds/DS18B20.pdf](http://datasheets.maximintegrated.com/en/ds/DS18B20.pdf).  That is why the 5V on the Raspberry Pi is connected to the +3V pin on the Thermo plug.  The 3.3V pin on the Raspberry Pi is good up to 30 mA but the 5V pin can handle substantially more current.  The one-wire sensor shouldn't draw more than a couple of mA but to be safe the 5V pin is used.  

A Jeelabs Output Plug [http://moderndevice.com/product/jeelabs-output-plug/](http://moderndevice.com/product/jeelabs-output-plug/) is also supported by changing the code to use the I2C heating process instead of the GPIO.  Change the following line:  
`pheat = Process(name = "heatProcGPIO", target=heatProcGPIO, args=(cycle_time, duty_cycle, child_conn_heat))`  
to  
`pheat = Process(name = "heatProcI2C", target=heatProcI2C, args=(cycle_time, duty_cycle, child_conn_heat))`  
if the Jeelabs Output Plug is used.



**Python Modules:**  
Install pip (package installer):  
	`sudo apt-get install python-setuptools`  

Install PySerial:  
	`sudo pip install pyserial`  
[http://pyserial.sourceforge.net/pyserial.html](http://pyserial.sourceforge.net/pyserial.html)  

Install Python i2c and smbus:  
	`sudo apt-get install python-smbus`                
[http://www.acmesystems.it/i2c](http://www.acmesystems.it/i2c)  

Install Web.py:  
	`sudo easy_install web.py`  
[http://webpy.org/](http://webpy.org/)

**RasPiBrew:**   
In Raspberry Pi terminal window:  

	sudo bash
	cd /var
	mkdir www
Copy software to `/var/www` preserving the directory structure.     
Start Putty on Windows and type login name and password.      
Program must be run as superuser:  Type `sudo bash`      
Start program by typing: `python raspibrew`     
Next, start the firefox browser on a computer on your network.  If ip address of the Raspberry Pi is 192.168.1.3 then point the browser to http://192.168.1.3:8080

How to Start RasPiBrew on Boot up:

Create a new file: `/etc/init.d/raspibrew` as superuser and insert the following script:

	#! /bin/sh
	# /etc/init.d/raspibrew

	### BEGIN INIT INFO
	# Provides:          raspibrew
	# Required-Start:    $remote_fs $syslog
	# Required-Stop:     $remote_fs $syslog
	# Default-Start:     2 3 4 5
	# Default-Stop:      0 1 6
	# Short-Description: Simple script to start a program at boot
	# Description:       A simple script from www.stuffaboutcode.com which will start / st$
	### END INIT INFO

	# If you want a command to always run, put it here

	# Carry out specific functions when asked to by the system
	case "$1" in
  		start)
    		echo "Starting RasPiBrew"
    		# run application you want to start
    		python /var/www/raspibrew.py
    	;;
  		stop)
    		echo "Stopping RasPiBrew"
    		# kill application you want to stop
    		killall python
    		python /var/www/cleanupGPIO.py
    	;;
  	*)
    	echo "Usage: /etc/init.d/raspibrew {start|stop}"
    	exit 1
    	;;
	esac

	exit 0

Make script executable:  
`sudo chmod 755 /etc/init.d/raspibrew`  

Register script to be run at start-up:  
`sudo update-rc.d raspibrew defaults`

To Remove script from start-up:  
`sudo update-rc.d -f  raspibrew remove`

To test starting the program:  
`sudo /etc/init.d/raspibrew start`

To test stopping the program:  
`sudo /etc/init.d/raspibrew stop`

[http://www.stuffaboutcode.com/2012/06/raspberry-pi-run-program-at-start-up.html](http://www.stuffaboutcode.com/2012/06/raspberry-pi-run-program-at-start-up.html)

**IDE for Development:**  
Create root password on Raspberry Pi:  
	`sudo passwd root`  
    Enter new UNIX password: `raspberry`  

Install Aptana Studio 3 for IDE on your computer:  
[http://www.aptana.com/products/studio3](http://www.aptana.com/products/studio3)  
This is used for programming in Python, Javascript, web page design and 1-click synchronization with Raspberry Pi

After creating a project and adding all source files, right click on project name.  
Select `Publish` and then `Run Web Development Wizard...`  
Select `FTP/SFTP/FTPS` and fill out form such as in the following image:  

![](https://github.com/steve71/RasPiBrew/raw/master/img/aptana_sftp_connection.png)  

Everytime files are saved on your computer they are automatically sent over to the Raspberry Pi.
