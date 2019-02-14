exports.config = require('./config/register')({
    env: 'beta',
    params: {
        browser: 'chromium'
    },
    specs: [
        //'tests/notice/notice.feature',
        //'tests/investor/nonExisting.feature',
        //'tests/investor/invest.feature',
        //'tests/auth/sign.feature',
        //'tests/compliance/edge/invalidHeader.feature'
        //'tests/provider/select.feature'
        //'tests/ticker/reserve.feature',
        'tests/compliance/complianceOnly.feature'
        //'tests/token/createAndCancelThirdTransaction.feature'
        //'tests/general/termsAndConditions.feature'
    ],
}).config;