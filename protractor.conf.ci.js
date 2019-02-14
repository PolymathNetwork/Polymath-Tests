exports.config = require('./config/register')({
    env: 'develop',
    params: {
        browser: 'chromium',
        extensions: 'metamask',
    }
}).config;