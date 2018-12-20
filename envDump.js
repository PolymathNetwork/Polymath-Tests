const fs = require('fs');
const envVars = ['TEST_', 'REACT_', 'POLYMATH_', 'WEB3_', 'SENDGRID_']

fs.writeFileSync('.env', Object.keys(process.env).filter(k => envVars.find(e => k.startsWith(e)) != null).map(v => `${v}=${process.env[v]}`).join('\n') || '');
