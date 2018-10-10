#!/usr/bin/env node
/** Convert a VSTest run into a docker run */
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const isChildOf = (child, parent) => {
    if (child === parent) return false;
    const parentTokens = parent.split(path.sep).filter(i => i.length)
    return parentTokens.every((t, i) => child.split(path.sep)[i] === t);
}

const envVars = ['METAMASK_NETWORK', 'METAMASK_SECRET', 'METAMASK_ACCOUNT_NUMBER',
    // Tests config
    'GMAIL_USER', 'GMAIL_PASSWORD', 'CBT_KEY', 'CBT_USER', 'FAIL_LOG', 'UPLOAD_PROVIDERS',
    'GANACHE_PORT', 'BRANCH', 'EXTRA_PATH', 'SKIP_OFFCHAIN', 'PRINT_LOGS',
    'REACT_APP_NETWORK_KOVAN', 'REACT_APP_NETWORK_MAIN', 'SENDGRID_API_KEY',
    // DIRS
    'TMP_DIR', 'REPORTS_DIR', 'LOG_DIR', 'CHECKOUT_DIR', 'NO_DELETE_ENV',
    // Browser config
    'BROWSER', 'mongo', 'SPECS', 'TAGS', 'EXTENSIONS',
    'ENV', 'SEED', 'BSBROWSER']
fs.writeFileSync('.env.docker', envVars.map(v => process.env[v] ? `${v}=${process.env[v]}` : '').filter(e => e).join('\n'));

const dockerFolder = 'docker-content';
fs.mkdirpSync(dockerFolder);
const map = [];
const newArgv = [];
for (let arg of process.argv.splice(2)) {
    if (fs.existsSync(arg) && !isChildOf(arg, __dirname)) {
        let alias = path.join(dockerFolder, Buffer.from(arg).toString('base64'));
        console.log(`Storing ${arg} in ${alias}`);
        map.push({ original: arg, alias: alias });
        arg = alias;
    }
    newArgv.push(arg);
}
console.log(`Building docker image...`);
execSync('docker build --build-arg startApps=false -t tests .', { stdio: 'inherit' });

console.log(`Running '${newArgv.join(' ')}'`);

execSync('docker stop test_run || true && docker rm test_run || true');
execSync(`docker run -d --name test_run -it --rm -v ${__dirname}:/tests tests`, { stdio: 'inherit' });
execSync(`docker exec test_run sh -c "source .env.docker && yarn install && yarn test ${newArgv.join(' ')}"`, { stdio: 'inherit' });
execSync(`docker stop test_run`, { stdio: 'inherit' });

console.log('Run complete');
for (let { original, alias } of map) {
    fs.copyFileSync(alias, original);
}
console.log('Finished');
