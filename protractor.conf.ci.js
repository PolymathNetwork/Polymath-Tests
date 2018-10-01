exports.config = require('./config/register')({
    env: 'local',
    params: {
        browser: 'puppeteer',
        extensions: 'metamask',
    }
}).config;