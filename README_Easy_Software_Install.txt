Simple Complete Raspberry Pi & RasPiBrew Software Installation from Windows
---------------------------------------------------------------------------

1) Google SDFormatter, Win32DiskImager and Putty and download them
2) Use SDFormatter to format SD card
3) Use Win32DiskImager to burn latest Raspbian Image from http://www.raspberrypi.org/downloads/
4) When Raspberry pi boots up:
	a) Expand Filesystem
	b) Set Internationalisation options
5) Reboot the Raspberry Pi
6) Type: 'sudo nano /etc/network/interfaces' and set up static ip as shown in the `interface` file that is in the RasPiBrew directory
7) Type: 'sudo nano /boot/config.txt'.  At the bottom of the file add the line 'dtoverlay=w1-gpio' and save the file to enable one wire devices
8) Type: 'sudo reboot' to reboot the Raspberry Pi
9) Type: 'sudo git clone https://github.com/steve71/RasPiBrew.git /var/www'
10) Use Putty to log onto the Raspberry Pi
11) Type: 'chmod +x raspibrew_setup.sh' to make it executable
12) Type: 'sudo ./raspibrew_setup.sh' and follow prompts
13) Edit the documented config.xml file in RasPiBrew directory to enter temp sensor ids and pins used for controlling a heating element.
(The temp sensor id is located in the following directory: /sys/bus/w1/devices/).  Edit other options as desired.

Note: In RasPiBrew directory type 'sudo git fetch' to get the latest version.
