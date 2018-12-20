#!/usr/bin/env node
/** Convert a VSTest run into a docker run */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function copyFileSync(source, target) {
    var targetFile = target;
    if (!fs.existsSync(source)) {
        console.warn(`Docker Launcher: ${source} doesn't exist, can't copy to ${target}`);
        return;
    }
    //if target is a directory a new file with the same name will be created
    if (fs.lstatSync(source).isDirectory()) return copyFolderRecursiveSync(source, target);
    if (fs.existsSync(target)) {
        if (fs.lstatSync(target).isDirectory()) {
            targetFile = path.join(target, path.basename(source));
        }
    }
    fs.writeFileSync(targetFile, fs.readFileSync(source));
}

function copyFolderRecursiveSync(source, target) {
    var files = [];
    if (!fs.existsSync(source)) {
        console.warn(`Docker Launcher: ${source} doesn't exist, can't copy to ${target}`);
        return;
    }
    if (!fs.lstatSync(source).isDirectory()) return copyFileSync(source, target);

    //check if folder needs to be created or integrated
    var targetFolder = path.join(target, path.basename(source));
    if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder);
    }

    //copy
    if (fs.lstatSync(source).isDirectory()) {
        files = fs.readdirSync(source);
        files.forEach(function (file) {
            var curSource = path.join(source, file);
            if (fs.lstatSync(curSource).isDirectory()) {
                copyFolderRecursiveSync(curSource, targetFolder);
            } else {
                copyFileSync(curSource, targetFolder);
            }
        });
    }
}

const isChildOf = (child, parent) => {
    child = child.toLowerCase();
    parent = parent.toLowerCase();
    const relative = path.relative(parent, child);
    console.log(`Relative of ${child} to ${parent} is ${relative}`);
    return (!!relative && relative.split(path.sep)[0] !== '..' && relative !== child) ? relative : false;
}

require('./envDump');
const dockerFolder = 'docker-content';
if (!fs.existsSync(dockerFolder)) fs.mkdirSync(dockerFolder);
const map = [];
const newArgv = [];
for (let arg of process.argv.splice(2)) {
    let fullPath = path.resolve(arg);
    let rel = isChildOf(fullPath, __dirname);
    console.log(`Relative is ${rel}`);
    if (!rel) {
        let alias = path.join(dockerFolder, Buffer.from(arg).toString('base64'));
        if (fs.existsSync(fullPath)) {
            copyFolderRecursiveSync(fullPath, alias);
        }
        console.log(`Storing ${arg} in ${alias}`);
        map.push({ original: arg, alias: alias });
        rel = alias;
    }
    newArgv.push(rel);
}

console.log(`Docker Launcher: Running with '${newArgv.join(' ')}'`);
let dockerBuild = 'josepmc/tests';
let dir = __dirname;
if (process.env.BUILD_DOCKER) {
    console.log(`Docker Launcher: Building docker image...`);
    dockerBuild = 'tests';
    execSync(`docker build -t ${dockerBuild} .`, { stdio: 'inherit' });
}

console.log(`Docker Launcher: Starting...`);
if (!process.env.NO_LAUNCH_DOCKER) {
    try { execSync('docker stop test_run', { stdio: 'inherit' }); } catch (error) { }
    try { execSync('docker wait test_run', { stdio: 'inherit' }); } catch (error) { }
    try { execSync('docker rm test_run', { stdio: 'inherit' }); } catch (error) { }
    try { execSync('docker wait test_run', { stdio: 'inherit' }); } catch (error) { }
    execSync(`docker run -d --name test_run -it -e NO_APP=true --rm -v ${dir}:/tests ${dockerBuild}`, { stdio: 'inherit' });
    console.log('Docker Launcher: Instance running');
}
let failed = false;
try {
    console.log('Docker Launcher: Launching tests...');
    execSync(`docker exec test_run bash -c "yarn install && yarn test ${newArgv.join(' ')}"`, { stdio: 'inherit' });
} catch (error) {
    failed = error;
    console.warn('Docker Launcher: Error captured, restoring files...');
}
try { execSync('docker stop test_run', { stdio: 'inherit' }); } catch (error) { }

console.log('Docker Launcher: Run complete, restoring files...');
for (let { original, alias } of map) {
    copyFolderRecursiveSync(alias, original);
}
console.log('Docker Launcher: Files restored');
if (failed) throw error;
