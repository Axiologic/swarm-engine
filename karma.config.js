module.exports = function(config) {
    config.set({
        basePath: '',
        frameworks: ["mocha"],
        files: [
            './builds/devel/webshims.js',
            './builds/devel/pskruntime.js',
            './builds/devel/pskclient.js',
            {pattern:'./tests/**/*-browserTest.js'},
            {pattern:'./tests/**/interact/**/*.js'}
        ],
        exclude: [
        ],
        client: {
            clearContext: false,
            karmaHTML:{
                source: [
                    {src:'./tests/psk-unit-testing/interact/wmqTest/parent/parent.html', tag:'index'},
                    {src:'./tests/psk-unit-testing/interact/wmqTest/children/iframe.html', tag:'iframe'},
                ]
            },
            auto: true,
        },
        preprocessors: {},
        reporters: ['dots','karmaHTML'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['Chrome','Firefox'],
        singleRun: true,
        plugins : [
            /*'karma-junit-reporter',*/
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-opera-launcher',
            'karma-ie-launcher',
            'karma-mocha',
            'karma-html'
        ],
    });
};