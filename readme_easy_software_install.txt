Simple Complete Raspberry Pi & RasPiBrew Software Installation from Windows
---------------------------------------------------------------------------

1) Google SDFormatter, Win32DiskImager, Putty and WinSCP and download all the software
2) Use SDFormatter to format SD card
3) Use Win32DiskImager to burn latest Raspbian Image from http://www.raspberrypi.org/downloads/
4) When Raspberry pi boots up:
	a) Expand Filesystem
	b) Set Internationalisation options
5) Reboot the Raspberry Pi
6) Type: 'sudo nano /etc/network/interfaces' and set up static ip as shown in the interface file that is in the RasPiBrew directory
7) Type: 'sudo reboot'
8) Download Putty and WinSCP
9) Using WinSCP copy Raspibrew software to /home/pi
10) Use putty to log onto the Raspberry Pi
11) Go into RasPiBrew directory
12) type: 'chmod +x raspibrew_setup.sh'
13) type: 'sudo ./raspibrew_setup.sh' and follow prompts