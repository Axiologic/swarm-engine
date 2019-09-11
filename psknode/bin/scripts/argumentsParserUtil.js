class InvalidArgumentError extends Error {
    constructor(invalidArgumentName) {
        super('Invalid argument found ' + invalidArgumentName);
        this.argumentName = invalidArgumentName;
        Error.captureStackTrace(this, InvalidArgumentError);
    }
}

class MissingValueError extends Error {
    constructor(message) {
        super(message);
        Error.captureStackTrace(this, MissingValueError);
    }
}

module.exports = {
    populateConfig: function populateConfig(configObject) {
        const argv = Object.assign([], process.argv);
        argv.shift();
        argv.shift();
        for (let i = 0; i < argv.length; ++i) {
            if(argv[i] == "quick"){
                argv[i] = '--quick=true';
            }
            if (!argv[i].startsWith('--')) {
                throw new InvalidArgumentError(argv[i]);
            }

            const argument = argv[i].substr(2);

            const argumentPair = argument.split('=');
            if (argumentPair.length > 1) {
                editConfig(argumentPair[0], argumentPair[1]);
            } else {
                if (typeof argv[i + 1] === "undefined" || argv[i + 1].startsWith('--')) {
                    //if next arg in line starts with -- default value of our arg is true
                    editConfig(argument, true);
                }else{
                    editConfig(argument, argv[i + 1]);
                    i += 1;
                }
            }
        }

        function editConfig(key, value) {
            if (!configObject.hasOwnProperty(key)) {
                throw new InvalidArgumentError(key);
            }

            configObject[key] = value;
        }
    },
    Errors: {
        InvalidArgumentError,
        MissingValueError
    }
};
