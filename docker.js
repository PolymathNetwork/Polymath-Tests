#!/usr/bin/env node
/** Convert a VSTest run into a docker run */
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const isChildOf = (child, parent) => {
    const relative = path.relative(parent, child);
    return !!relative && relative.split(path.sep)[0] !== '..';
}

const envVars = ['METAMASK_NETWORK', 'METAMASK_SECRET', 'METAMASK_ACCOUNT_NUMBER',
    // Tests config
    'GMAIL_USER', 'GMAIL_PASSWORD', 'CBT_KEY', 'CBT_USER', 'FAIL_LOG', 'UPLOAD_PROVIDERS',
    'GANACHE_PORT', 'BRANCH', 'EXTRA_PATH', 'SKIP_OFFCHAIN', 'PRINT_LOGS',
    'REACT_APP_NETWORK_KOVAN', 'REACT_APP_NETWORK_MAIN', 'SENDGRID_API_KEY',
    // DIRS
    'TMP_DIR', 'REPORTS_DIR', 'LOG_DIR', 'CHECKOUT_DIR', 'NO_DELETE_ENV', 'NO_STARTUP',
    // Browser config
    'BROWSER', 'mongo', 'SPECS', 'TAGS', 'EXTENSIONS',
    'ENV', 'SEED', 'BSBROWSER']
fs.writeFileSync('.env.docker', envVars.map(v => process.env[v] ? `${v}=${process.env[v]}` : '').filter(e => e).join('\n'));

const dockerFolder = 'docker-content';
fs.mkdirpSync(dockerFolder);
const map = [];
const newArgv = [];
for (let arg of process.argv.splice(2)) {
    let fullPath = path.resolve(arg);
    if (!isChildOf(fullPath, __dirname)) {
        let alias = path.join(dockerFolder, Buffer.from(arg).toString('base64'));
        if (fs.existsSync(fullPath)) fs.copySync(fullPath, alias);
        console.log(`Storing ${arg} in ${alias}`);
        map.push({ original: arg, alias: alias });
        arg = alias;
    }
    newArgv.push(arg);
}

let dockerBuild = process.env.DOCKER_BUILD || 'tests';
let dir = __dirname;
if (!process.env.DOCKER_BUILD) {
    console.log(`Building docker image...`);
    execSync(`docker build -t ${dockerBuild} .`, { stdio: 'inherit' });
}

console.log(`Running '${newArgv.join(' ')}'`);
execSync('docker stop test_run || true && docker rm test_run || true');
execSync(`docker run -d --name test_run -it -e NO_APP=true --rm -v ${dir}:/tests ${dockerBuild}`, { stdio: 'inherit' });
execSync(`docker exec test_run bash -c "source .env.docker && yarn install && yarn test ${newArgv.join(' ')}" || true`, { stdio: 'inherit' });
execSync(`docker stop test_run || true`, { stdio: 'inherit' });

console.log('Run complete');
for (let { original, alias } of map) {
    fs.copySync(alias, original);
}
console.log('Finished');
