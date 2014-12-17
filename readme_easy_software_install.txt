Simple Complete Raspberry Pi & RasPiBrew Software Installation from Windows
---------------------------------------------------------------------------

1) Google SDFormatter, Win32DiskImager, Putty and WinSCP and download them
2) Use SDFormatter to format SD card
3) Use Win32DiskImager to burn latest Raspbian Image from http://www.raspberrypi.org/downloads/
4) When Raspberry pi boots up:
	a) Expand Filesystem
	b) Set Internationalisation options
5) Reboot the Raspberry Pi
6) Type: 'sudo nano /etc/network/interfaces' and set up static ip as shown in the interface file that is in the RasPiBrew directory
7) Type: 'sudo reboot' to reboot the Raspberry Pi
8) Use WinSCP to copy Raspibrew software to /home/pi
9) Use Putty to log onto the Raspberry Pi
10) Go into RasPiBrew directory
11) Type: 'chmod +x raspibrew_setup.sh' to make it executable
12) Type: 'sudo ./raspibrew_setup.sh' and follow prompts
13) Edit the documented config.xml file