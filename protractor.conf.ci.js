exports.config = require('./config/register')({
    env: 'develop',
    params: {
        browser: 'puppeteer',
        extensions: 'metamask',
    }
}).config;