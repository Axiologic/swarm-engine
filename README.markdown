# PrivateSky

PrivateSky core GitHub public repository. Based on Axiologic's work on a new execution engine for swarms.
Still very beta, for the next months this repository will be used for coordination between partners.

How should be used for third party applications or by external contributors:
- clone it
- add your list of modules and libraries in release or in other folder
- config and execute build-devel.js
- execute engine/launcher.js

## Building and running

Firstly, the dev/build-devel.js files should be executed. We offer some predefined configurations that will download only the
dependencies necessary for what needs to run next. If you want to configure what gets downloaded you need to use
 any of these flags (you can use multiple):
- --virtualmq - downloads the dependencies to run VirtualMQ
- --pskwallet - downloads the dependencies to run PskWallet
- --all - this is the default one if you don't specify any flags, it downloads all dependencies for the entire project 

After getting the dependencies you need you can run (for now) VirtualMq using the bin/virtualMQ.sh file.
This will start an instance of VirtualMq on the port 8080 and using the 'tmp' folder inside the project root.You can also
customize this using the next parameters:

- --port PORT - it will set the port number
- --folder PATH - it will set the root folder for all operations done by VirtualMq

Example: bin/virtualMQ.sh --port 8081 --folder /path/to/root/folder

### Temporary precautions
- if running on Windows enable/grant symlink option/permissions

For security and code quality reasons all the integration here and releases will be performed manually by a very small core of developers (Sinica and Cosmin)!

The stable releases will be merged periodically  https://github.com/Axiologic/swarm-engine or will be branched.
https://github.com/PrivateSky/privatesky  is unstable and is developed in master branch. Use it just as a preview for the newer releases.

The documentation is not ready for public (only for partners)  but if you want access, please send an email to abss@axiologic.net

Current Release: 0.5.0 (Unstable and incomplete) The first public release (0.9.0 as a preview for the the whole architecture) is scheduled on October 2018.
