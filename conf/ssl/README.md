## How to get HTTPS working with VirtualMQ

1. Place in this folder 2 files:
  * server.cert
  * server.key

    They need to be valid certificates (not self signed or expired) or else VirtualMQ won't boot

2. Run pskadmin console app and update the remote connections for each domain that needs to communicate via https
