let baseConfig = require('./config/register')({
    env: 'local',
    params: {
        browser: 'chrome'
    }
});

exports.config = {
    ...baseConfig.config,
    specs: [
        //'tests/notice/notice.feature',
        //'tests/investor/nonExisting.feature',
        //'tests/investor/invest.feature',
        'tests/auth/sign.feature',
        //'tests/ticker/reserve.feature',
        //'tests/compliance/complianceSanity.feature'
    ],
}