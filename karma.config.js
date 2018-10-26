module.exports = function(config) {
    config.set({
        basePath: '',
        frameworks: ["mocha"],
        files: [
            './builds/devel/webruntime.js',
            './builds/devel/pskruntime.js',
            {pattern:'./tests/**/*-browserTest.js'},
            {pattern:'./modules/interact/quicktest/new-interact/**/*.js'},
        ],
        exclude: [
        ],
        client: {
            karmaHTML:{
                source: [
                    {src:'./modules/interact/quicktest/new-interact/web/parent/parent.html', tag:'index'},
                    {src:'./modules/interact/quicktest/new-interact/web/children/iframe.html', tag:'iframe'},
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
        browsers: ['Chrome'],
        singleRun: false,
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