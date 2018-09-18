/*
Rebuild sources
Start A Virtual MQ
Start a Launcher
 */

const { spawn } = require('child_process');
const http = require('http')

spawn('node', ['./bin/pskbuild.js', './builds/build.json']);

const port = 3000;

const requestHandler = (request, response) => {
    console.log(request.url)
    response.end('Hello privateSky Server!')
}

const server = http.createServer(requestHandler);

server.listen(port, (err) => {
    if (err) {
        return console.log('Something bad happened', err)
    }

    console.log(`Server is listening on ${port}`)
})


