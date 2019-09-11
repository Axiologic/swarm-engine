/**
 * The script is divided in the following sections:
 *
 * 1. Dependency declaration section
 *
 *       Dependencies are described in a json object with a key "common" that holds common dependencies for
 *    all platforms, a key for each platform and a key "lateCommon" for common dependencies that will be
 *    resolved after the platform specific ones.
 *
 *       The order of resolution is "common", platform specific, "lateCommon". However, inside these keys,
 *    it is not guaranteed that the resolution will take place in the order they were specified in.
 *
 *       The values for these keys can be two things:
 *
 *    - the result from a call to one of the functions of "VersionRequirement" (see bellow for what it does)
 *    - an object (in this case the name of this dependency is used only as a category when viewed by people but
 *      ignored by this script). This object contains the name a strategy to match the actual dependency
 *      (for example to match at least one from multiple dependencies) and has as value the same result from calling
 *      a function from "VersionRequirement" as above
 *
 * 2. Utility functions
 *
 * a. Version - Class that represents a version. It represents the major, minor and patch versions as numbers
 *    in order to make comparing easier. This representation follows Semantic Versioning standard, meaning a version
 *    like "X.Y.Z" has X - major version, Y - minor version, Z - patch version
 *
 * b. Version parsers - Different utility functions that parse the version as returned by different programs and return
 *    instances of the Version class
 *
 * c. VersionRequirement - Class that provides an easy way to specify versions in the dependencies object.
 *    It captures this version as the target version and returns a function that can check if the given version
 *    matches this target version based on different strageties. For example:
 *    - from(version) - it accepts any newer version
 *    - upToNextMajor(version) - it accepts versions that are newer but with the same major version
 *      (to maintain compatibility in cases where a new major version could break that,
 *      for example, python 3 is not compatible with python 2)
 *    - upToNextMinor(version) - it accepts only versions with the same major and minor versions,
 *      allowing flexibility in the patch version
 *    - exact(version) - it accepts only this specific version
 *
 * d. dependenciesRunners - This object specifies functions that read the current version from the system of
 *    a specific dependency and return the result of calling the matching function given by the VersionRequirement.
 *    This object has as keys the name of the dependency (matching those in the dependency declaration object).
 *    If the dependency is a platform specific one, the name is prefixed by the platform name followed by '-' sign.
 *
 * e. possibleStrategies - When declaring dependencies not all of them might be needed or some might have alternatives.
 *    For example, you might need a compiler but it can be one of many compilers. This object provides one such strategy
 *    that matches "oneOf" many dependencies.
 *
 */

const childProcess = require('child_process');
const os = require('os');
const util = require('util');
const inspect = Symbol.for('nodejs.util.inspect.custom');

let dependencies = {};
const platform = os.platform();
const DEBUG = false;

/********************** DEPENDENCY DECLARATION **********************/

// nextTick used to be able to use VersionRequirement object before it's declaration in file
process.nextTick(() => {
    dependencies = {
        common: {
            node: VersionRequirement.from('10.15.3'),
            python: VersionRequirement.upToNextMajor('2.7.0'),
        },
        linux: {
            compiler: {
                oneOf: {
                    'g++': VersionRequirement.from('5.3.1'),
                    clang: VersionRequirement.from('5.0.0')
                }.onFailure('For more information, see: https://github.com/PrivateSky/privatesky/wiki/Setup')
            }
        },
        darwin: {
            compiler: {
                oneOf: {
                    'g++': VersionRequirement.from('5.3.1'),
                    clang: VersionRequirement.from('5.0.0')
                }.onFailure('For more information, see: https://github.com/PrivateSky/privatesky/wiki/Setup')
            }
        },
        win32: {
            VisualStudio: VersionRequirement.from('15.9') // Visual Studio 2017
        },
        lateCommon: {
            npm: VersionRequirement.from('6.11.0')
        }
    };
});

/********************** ENTRY POINT FOR DEPENDENCY CHECKING **********************/

checkDependencies();

/********************** UTILITY FUNCTIONS **********************/

const failureMessage = Symbol('failureMessage');

Object.prototype.onFailure = function (message) {
    Object.defineProperty(this, failureMessage, {
        value: message
    });
    return this;
};

function dependencyCheckFailed(reason) {
    console.error(reason);
    process.exit(1);
}

function log(...args) {
    if (DEBUG) {
        console.log(...args);
    }
}

/**
 * Version class as specified by Semantic Versioning standard, support for prerelease suffix is not supported
 * @param {Number} major
 * @param {Number} minor
 * @param {Number} patch
 * @constructor
 */
function Version(major, minor = 0, patch = 0) {
    this.major = major;
    this.minor = minor;
    this.patch = patch;

    Version.prototype.toString = function () {
        return `${this.major}.${this.minor}.${this.patch}`;
    };

    Version.prototype[inspect] = function () {
        return `Version(${this.toString()})`;
    }
}

/**
 * Parses a version string and returns an instance of Version
 * @param {string} version - formatted as "X.Y.Z"
 * @return {Version}
 * @throws
 */
function basicVersionParser(version) {

    const versionSplit = version.split('.').map(Number);

    if (versionSplit.length > 3) {
        const message = `Invalid version found ${version} because it does not respect the "X.Y.Z" format`;
        throw new Error(message);
    }

    for (const versionNumber of versionSplit) {
        if (Number.isNaN(versionNumber)) {
            const message = `Invalid version found ${version} because it contains non numerical version number`;
            throw new Error(message);
        }
    }

    return new Version(versionSplit[0], versionSplit[1], versionSplit[2]);
}

/**
 *
 * @param {string} version - formatted as v12.10.0
 * @return {Version}
 */
function nodeJsVersionParser(version) {
    return basicVersionParser(version.slice(1))
}

/**
 *
 * @param version - formatted as Python 2.7.16
 * @return {Version}
 */
function pythonVersionParser(version) {
    return basicVersionParser(version.split(' ')[1]);
}

/**
 *
 * @param {string} version - most likely formatted as 15.9.28307.812
 */
function vsBuildVersionParser(version) {
    version = version.split('.')
        .filter((element, index) => index < 3) // keep the first 3 parts of version
        .join('.');

    return basicVersionParser(version);
}

/**
 * Used to specify constraints on a version.
 * @type {{upToNextMinor(*): void, upToNextMajor(*=): *, exact(*=): *, from(*=): *}}
 */
const VersionRequirement = {
    from(version) {
        const targetVersion = basicVersionParser(version);

        /**
         * Checks that the current version is newer than the target version
         * @param {Version} currentVersion
         * @property {Version} targetVersion
         * @return {boolean}
         */
        function compare(currentVersion) {
            if (currentVersion.major < targetVersion.major) {
                return false;
            } else if (currentVersion.major > targetVersion.major) { // continue validation only if versions are equal
                return true;
            }

            if (currentVersion.minor < targetVersion.minor) {
                return false;
            } else if (currentVersion.minor > targetVersion.minor) { // continue validation only if versions are equal
                return true;
            }

            if (currentVersion.patch < targetVersion.patch) {
                return false;
            }

            return true;
        }

        compare.toString = function () {
            return `from "${version}"`
        };
        compare[inspect] = compare.toString;
        compare.targetVersion = version;

        return compare
    },

    upToNextMajor(version) {
        const targetVersion = basicVersionParser(version);

        /**
         * Checks that current version is newer than target version, but not having major version be the same
         * @param {Version} currentVersion
         * @property {Version} targetVersion
         * @return {boolean}
         */
        function compare(currentVersion) {
            if (currentVersion.major !== targetVersion.major) {
                return false;
            }

            if (currentVersion.minor < targetVersion.minor) {
                return false;
            } else if (currentVersion.minor > targetVersion.minor) { // continue validation only if versions are equal
                return true;
            }

            if (currentVersion.patch < targetVersion.patch) {
                return false;
            }

            return true;
        }

        compare.toString = function () {
            return `upToNextMajor "${version}"`
        };
        compare[inspect] = compare.toString;
        compare.targetVersion = version;

        return compare;
    },

    upToNextMinor(version) {
        throw new Error('Not implemented');
    },


    exact(version) {
        const targetVersion = basicVersionParser(version);

        /**
         * @param {Version} currentVersion
         * @return {boolean}
         */
        function compare(currentVersion) {
            if (targetVersion.major !== currentVersion.major) {
                return false;
            }

            if (targetVersion.minor !== currentVersion.minor) {
                return false;
            }

            if (targetVersion.patch !== currentVersion.minor) {
                return false;
            }

            return true;
        }

        compare.toString = function () {
            return `exact "${version}"`
        };
        compare[inspect] = compare.toString;
        compare.targetVersion = version;

        return compare;
    }
};

/**
 * Generic dependency runner for dependenciesRunners object to remove duplication of code
 * for resolution of version for very similar
 * @param {string} dependencyName
 * @param {?string=} helperLink - URL to read in case the dependency resolution fails
 * @return {function(*=): ({valid: boolean, reason: string}|{valid: boolean})}
 */
function getDependencyRunnerFor(dependencyName, helperLink) {
    /**
     * Calls an executable with --version flag and matched the version number using a regular expression
     * @param {string} processToSpawn
     * @return {?RegExpMatchArray}
     */
    function spawnAndGetVersion(processToSpawn) {
        const execOutput = childProcess.execSync(`${processToSpawn} --version`);

        if (!execOutput) {
            return null;
        }

        const endOfLine = JSON.stringify(os.EOL);

        const compilerVersion = execOutput.toString().split(endOfLine)[0];
        return compilerVersion.match(/(\d+.\d+.\d+)/)
    }

    /**
     * A generic parser and validator for versions
     * @param {?RegExpMatchArray} version
     * @param {function(Version):boolean} isValidVersion
     * @param {string} dependencyName
     * @return {{valid: boolean, reason: string}|{valid:boolean}}
     */
    function parseAndValidateVersion(version, isValidVersion, dependencyName) {
        if (version === null) {
            return {valid: false, reason: `Could not parse version of ${dependencyName}`};
        }

        const currentVersion = basicVersionParser(version[0]);

        if (!isValidVersion(currentVersion)) {
            let helperLinkMessage = '';
            if (helperLink) {
                helperLinkMessage = `To resolve this, you might try: ${helperLink}`;
            }

            return {
                valid: false,
                reason: `Invalid version for ${dependencyName}, expected minimum "${isValidVersion.targetVersion}" but got "${currentVersion}". ${helperLinkMessage}`
            };
        }

        return {valid: true};
    }


    return function (isValidVersion) {
        const versionOrNull = spawnAndGetVersion(dependencyName);
        return parseAndValidateVersion(versionOrNull, isValidVersion, dependencyName);
    }
}


/**
 * Object with functions that read the current version installed in the system and validates that
 * it matches the constraints in the dependencies object at the top of the file
 * @type {Object.<string, function():{valid: boolean, reason: string}|{valid:boolean}>}
 */
const dependenciesRunners = {
    /** @param {function(Version):boolean} isValidVersion */
    node: function (isValidVersion) {
        const currentVersion = nodeJsVersionParser(process.version);

        if (!isValidVersion(currentVersion)) {
            return {
                valid: false,
                reason: `Invalid version for Node.js, expected minimum "${isValidVersion.targetVersion}" but got "${currentVersion}"`
            };
        }

        return {valid: true};
    },
    /** @param {function(Version):boolean} isValidVersion */
    python: function (isValidVersion) {
        const pythonCallOutput = childProcess.spawnSync('python', ['--version']);
        if (pythonCallOutput.stderr === null) {
            return {
                valid: false,
                reason: `Could not find any version of python installed in the system, expected minimum version ${isValidVersion.targetVersion}`
            }
        }

        const pythonVersion = pythonCallOutput.stderr.toString(); // python outputs version on stderr
        const currentVersion = pythonVersionParser(pythonVersion);

        if (!isValidVersion(currentVersion)) {
            return {
                valid: false,
                reason: `Invalid version for Python, expected minimum "${isValidVersion.targetVersion}" but got "${currentVersion}"`
            };
        }

        return {valid: true};
    },
    npm: getDependencyRunnerFor('npm', 'npm install -g npm'),
    'node-gyp': getDependencyRunnerFor('node-gyp'),
    'linux-g++': getDependencyRunnerFor('g++'),
    'linux-clang': getDependencyRunnerFor('clang'),
    'darwin-g++': getDependencyRunnerFor('g++'),
    'win32-VisualStudio': function (isValidVersion) {
        const vsWherePath = 'C:\\Program Files (x86)\\Microsoft Visual Studio\\Installer\\vswhere.exe';

        const output = childProcess.spawnSync(vsWherePath, ['-products', '*']);

        if (output === null) {
            const helperMessage = 'For more instructions on how to resolve this, see: https://github.com/nodejs/node-gyp';
            return {
                valid: false,
                reason: `No version found for Visual Studio, expected minimum "${isValidVersion.targetVersion}". ${helperMessage}`
            }
        }

        // result is string formatted as: "installationVersion: 15.9.15.284"
        const lineWithInstallationVersion =
            output.stdout.toString()
                .split('\r\n')
                .filter(line => line.startsWith('installationVersion'))[0]; // take only the line that starts with installationVersion

        const versionAsString = lineWithInstallationVersion.split(' ')[1];
        const currentVersion = vsBuildVersionParser(versionAsString);

        if (!isValidVersion(currentVersion)) {
            const helperMessage = 'For more instructions on how to resolve this, see: https://github.com/nodejs/node-gyp';
            return {
                valid: false,
                reason: `Invalid version for Visual Studio Build Tools, expected minimum "${isValidVersion.targetVersion}" but got "${currentVersion}". ${helperMessage}`
            };
        }

        const msvsVersion = childProcess.execSync('npm config get msvs_version');

        if (msvsVersion === null) {
            return {
                valid: false,
                reason: `msvs_version is not set, run: npm config set msvs_version 2017`
            };
        }

        const msvsVersionString = msvsVersion.toString().substring(0, msvsVersion.length - 1); // removes \n from end of string ;

        if (!['2017', '2019'].includes(msvsVersionString)) {
            return {
                valid: false,
                reason: `msvs_version is not set, run: npm config set msvs_version 2017`
            }
        }

        return {valid: true};
    }

};

// run dependencies checks

/**
 * Logs the dependency object for current platform in an easy to read manner
 */
function logDependencies() {
    const depsObject = {};
    const deps = getDependencyListForCurrentPlatform();

    deps.forEach(({dependencyName, dependencyResolver}) => {
        depsObject[dependencyName] = dependencyResolver;
    });

    log(util.inspect(depsObject, {compact: false}));
}

/**
 * Combines the common dependencies with the platform specific ones
 * @return {{dependencyName: string, dependencyResolver: function|Object}[]}
 */
function getDependencyListForCurrentPlatform() {
    const dependenciesForCurrentPlatform = [];

    Object.entries(dependencies.common).forEach(([dependencyName, dependencyResolver]) => {
        dependenciesForCurrentPlatform.push({dependencyName, dependencyResolver});
    });

    if (dependencies.hasOwnProperty(platform)) {
        Object.entries(dependencies[platform]).forEach(([dependencyName, dependencyResolver]) => {
            dependenciesForCurrentPlatform.push({dependencyName, dependencyResolver});
        });
    }

    Object.entries(dependencies.lateCommon).forEach(([dependencyName, dependencyResolver]) => {
        dependenciesForCurrentPlatform.push({dependencyName, dependencyResolver});
    });

    return dependenciesForCurrentPlatform;
}

/**
 * Combines common dependencies with platform specific ones and tries to find them.
 */
function checkDependencies() {
    // nextTick is used to be able to call this function from the top of the script but with everything instantiated
    process.nextTick(() => {
        logDependencies();

        const dependencies = getDependencyListForCurrentPlatform();

        dependencies.forEach(({dependencyName, dependencyResolver}) => {
            const isValidVersionFn = dependencyResolver;

            if (typeof isValidVersionFn === 'function') {
                if (!dependenciesRunners.hasOwnProperty(dependencyName)) {
                    if (dependenciesRunners.hasOwnProperty(`${platform}-${dependencyName}`)) {
                        dependencyName = `${platform}-${dependencyName}`
                    } else {
                        throw new Error('Could not find a dependency runner for ' + dependencyName);
                    }
                }

                log('Running validation for dependency:', dependencyName, 'with constraint', isValidVersionFn.toString());

                try {
                    const result = dependenciesRunners[dependencyName](isValidVersionFn);

                    if (!result.valid) {
                        dependencyCheckFailed(result.reason);
                    }
                } catch (e) {
                    dependencyCheckFailed(`Could not find any version installed for ${dependencyName}, expected minimum version ${isValidVersionFn.targetVersion}`);
                }


            } else if (typeof isValidVersionFn === 'object') {
                const dependencyWithStrategy = isValidVersionFn; // rename for more clarity
                const strategiesForDependency = Object.keys(dependencyWithStrategy);

                if (strategiesForDependency.length !== 1) {
                    throw new Error('Invalid format for dependency, expected exactly one strategy');
                }

                const strategyType = strategiesForDependency[0];
                const dependencyFound = resolveStrategy(strategyType, dependencyWithStrategy[strategyType]);

                if (!dependencyFound) {
                    const reason = util.inspect(dependencyWithStrategy, {compact: false});
                    const helper = dependencyWithStrategy[strategyType][failureMessage] || '';
                    dependencyCheckFailed(`Could not resolve any dependency for ${dependencyName}, expected ${reason} \n${helper}`);
                }
            }
        });
    });
}

function resolveStrategy(strategyType, dependenciesForStrategy) {
    if (possibleStrategies.hasOwnProperty(strategyType)) {
        return possibleStrategies[strategyType](dependenciesForStrategy);
    } else {
        throw new Error('Unknown strategy ' + strategyType);
    }
}


const possibleStrategies = {
    oneOf: function oneOfStrategy(dependenciesForThisStrategy) {
        let dependencyFound = false;

        for (let depName in dependenciesForThisStrategy) {
            if (!dependenciesForThisStrategy.hasOwnProperty(depName)) {
                continue;
            }

            const isValidVersionFn = dependenciesForThisStrategy[depName];

            depName = `${platform}-${depName}`;
            log('Running validation for dependency:', depName, 'with constraint', isValidVersionFn.toString());

            try {
                const result = dependenciesRunners[depName](isValidVersionFn);

                if (result.valid) {
                    dependencyFound = true;
                    break;
                }
            } catch (e) {
                // ignore error, dependency not found, will be treated later
            }
        }

        return dependencyFound;
    }
};
