## How to get HTTPS working with VirtualMQ

1. Place in this folder 2 files:
  * server.cert
  * server.key

    They need to be valid certificates (not self signed or expired) or else VirtualMQ won't boot

2. Go back one folder and open "currentVersion" file. Search for "remoteInterfaces" (without quotes) and change "http" to "https" for the address where VirtualMQ will live
