module.exports = function(config) {
    config.set({
        basePath: '',
        frameworks: ["mocha"],
        files: [
            '../../../builds/devel/webruntime.js',
            '../../../builds/devel/pskruntime.js',
            /*{pattern:'../../../modules/pskwebfs/tests/browserTests/*.js'},*/
            {pattern:'../../../tests/**/*-browserTest.js'},
        ],
        exclude: [
        ],
        preprocessors: {},
        reporters: ['dots'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['Chrome'],
        singleRun: true,
        plugins : [
            /*'karma-junit-reporter',*/
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-opera-launcher',
            'karma-ie-launcher',
            'karma-mocha'
        ],
    });
};