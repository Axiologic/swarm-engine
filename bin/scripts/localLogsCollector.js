const path = require("path");
const os = require('os');

const addressForSubscribers = process.env.PSK_SUBSCRIBE_FOR_LOGS_ADDR || 'tcp://127.0.0.1:7001';
const logsOutputFolder = process.env.PSK_LOCAL_LOGS_OUTPUT_FOLDER || os.tmpdir();

const PSKLogger = require(path.join(__dirname, '../../modules/psklogger'));
const fs = require('fs');


const englishIntl = new Intl.DateTimeFormat('en',
    {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false
    }
);

let currentTime = englishIntl.format(Date.now());
currentTime = currentTime.replace(/[\s]/gm, '-');
currentTime = currentTime.replace(/,/gm, '');

let logsOutput = path.join(logsOutputFolder, `psk_logs-${currentTime}`);


if (fs.existsSync(logsOutput)) {
    logsOutput += `(${Math.random().toString().substring(2)})`;
}

console.log('Writing logs to:', logsOutput);

const outputFile = fs.createWriteStream(logsOutput, {flags: 'a+'});

const MessageSubscriber = PSKLogger.MessageSubscriberModule.MessageSubscriber;
new MessageSubscriber(addressForSubscribers, [''], (topic, message) => {
    outputFile.write(`topic: ${topic}, message: ${message.toString()}\n`);
});


// without these the child process won't close when the master is terminated

process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));