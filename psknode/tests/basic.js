const path = require('path');

const tir = require(path.resolve(path.join(__dirname, "util/tir.js")));
const assert = require('double-check').assert;

const domain = 'local';
const agent = 'exampleAgent';
const agents = [agent];

const swarm = {
    echo: {
        say: function(input) {
            this.return('Echo ' + input);
        }
    }
};

assert.callback('Basic Test', (finished) => {
    tir.addDomain(domain, agents, swarm);

    tir.launch(3000, () => {
        tir.interact(domain, agent).startSwarm("echo", "say", "Hello").onReturn(result => {
            assert.equal("Echo Hello", result);
            finished();
            tir.tearDown(0);
        });
    });
}, 2000);