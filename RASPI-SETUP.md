# Setting up the Raspberry Pi

## Load Operating System onto SDCard

Download the raspberry pi operating system:
[http://www.raspberrypi.org/downloads](http://www.raspberrypi.org/downloads "Raspberry Pi Operating System")

Use Win32DiskImager to install onto SDCARD:  
[http://www.softpedia.com/get/CD-DVD-Tools/Data-CD-DVD-Burning/Win32-Disk-Imager.shtml](http://www.softpedia.com/get/CD-DVD-Tools/Data-CD-DVD-Burning/Win32-Disk-Imager.shtml "Win32DiskImager")

There is a problem of SDcards not being recognized on laptops.  Use an sdcard hub or plug it into a device such as a camera and then connect the device to the computer is there is a problem recognizing the SDCard drive.

In terminal type:	  
	
	sudo apt-get update		
	sudo apt-get upgrade

## Beginner's Guide 

Follow the beginners guide to get up and running:  
[http://elinux.org/RPi_Beginners](http://elinux.org/RPi_Beginners)

Run `sudo setupcon` once manually after the keyboard is setup otherwise you may have long boot times.

## Setting up SSH
Tutorial:  
[http://fusionstrike.com/2012/setting-ssh-ftp-raspberry-pi-debian](http://fusionstrike.com/2012/setting-ssh-ftp-raspberry-pi-debian)

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

## Kernel Patch for Dallas 1-wire and I2C

Note that the following has *not* been tested with the new Raspbian Distribution and could cause you having to reinstall the operating system on the sdcard.

Automated script to add 1-wire and I2C drivers:  

     sudo bash
     wget http://www.frank-buss.de/raspberrypi/w1-test
     bash w1-test

Forum Describing the Kernel Patch  
[http://www.raspberrypi.org/phpBB3/viewtopic.php?f=44&t=6649](http://www.raspberrypi.org/phpBB3/viewtopic.php?f=44&t=6649) 


## Installation 

**Hardware**:
The raspberry pi is very expandable. 
Multiple 1-wire sensors can be connected to pin 4. 
Also more than one i2c Jeelab plug can be connected to the raspberry pi via the i2c interface.  The output plug was used in this project.  List of other i2c jeelab plugs:  
[http://jeelabs.net/projects/hardware/wiki/](http://jeelabs.net/projects/hardware/wiki/)  
There are many GPIO pins on the raspberry pi available but the use of a buffered interface on these is recommended which will help protect against damage.

**Python Modules:**  
Install PySerial:
[http://pyserial.sourceforge.net/pyserial.html](http://pyserial.sourceforge.net/pyserial.html)  
Install Python i2c and smbus:  
	`sudo apt-get install python-smbus`                
[http://www.acmesystems.it/i2c](http://www.acmesystems.it/i2c)  
Install Web.py:
[http://webpy.org/](http://webpy.org/)

Aptana Studio 3 for IDE:
[http://www.aptana.com/products/studio3](http://www.aptana.com/products/studio3)  
Programming Python, Javascript, web page design and 1-click synchronization with Raspberry Pi

Copy software to `/var/www` preserving the directory structure.     
Start Putty on Windows and type login name and password.      
Program must be run as superuser:  Type `sudo bash`      
Start program by typing: `python raspibrew`

