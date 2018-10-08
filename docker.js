#!/usr/bin/env node
/** Convert a VSTest run into a docker run */
const argv = require('yargs').argv;
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const isChildOf = (child, parent) => {
    if (child === parent) return false;
    const parentTokens = parent.split(path.sep).filter(i => i.length)
    return parentTokens.every((t, i) => child.split(path.sep)[i] === t);
}

const dockerFolder = 'docker-content';
fs.mkdirpSync(dockerFolder);
const map = [];
const newArgv = [];
for (let arg of argv) {
    if (fs.existsSync(arg) && !isChildOf(arg, __dirname)) {
        let alias = path.join(dockerFolder, Buffer.from(argv).toString('base64'));
        console.log(`Storing ${arg} in ${alias}`);
        map.push({ original: arg, alias: alias });
        arg = alias;
    }
    newArgv.push(arg);
}
console.log(`Building docker image...`);
execSync('docker build -t tests . --build-args startApps=false', { stdio: 'inherit' });

console.log(`Running '${newArgv.join(' ')}'`);

execSync(`docker run -it --rm -v ${__dirname}:/tests tests --name test_run`, { stdio: 'inherit' });
execSync(`docker exec --name test_run "yarn install && yarn test ${newArgv.join(' ')}"`, { stdio: 'inherit' });
execSync(`docker stop --name test_run`, { stdio: 'inherit' });

console.log('Run complete');
for (let { original, alias } of map) {
    fs.copyFileSync(alias, original);
}
console.log('Finished');