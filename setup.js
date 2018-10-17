#!/usr/bin/env node
const { join } = require('path');
const { mkdirpSync, removeSync, readFileSync, pathExistsSync, writeFileSync, existsSync, createWriteStream } = require('fs-extra');
const { argv } = require('yargs');
const { execSync, exec } = require('child_process');
const deasync = require('deasync');
const treeKill = require('tree-kill');
let { MongodHelper } = require('@josepmc/mongodb-prebuilt');

if (!argv.params || !argv.params.setup || !(argv.params.setup === true || argv.params.setup instanceof Object)) {
    throw `Usage: setup.js [--params.setup.apps=[apps directory]] [--params.setup.ganache]
    All parameters are mutually exclusive`;
}

let currentDir = __dirname;
let checkoutDir = process.env.CHECKOUT_DIR || join(__dirname, 'git-checkout');
let pidsFile = join(checkoutDir, 'pids.pid');
console.log('Performing cleanup...');
if (existsSync(pidsFile)) {
    for (let p of readFileSync(pidsFile, 'utf8').split('\n')) {
        try { deasync(r => treeKill(p, 'SIGKILL', r))(); } catch (error) { }
    }
    removeSync(pidsFile);
}
if (process.env.COVERAGE !== false) process.env.COVERAGE = true;
if (!process.env.NO_DELETE_ENV) removeSync(checkoutDir);
mkdirpSync(checkoutDir);
let logDir = process.env.LOG_DIR || join(currentDir, 'logs');
mkdirpSync(logDir);

let sources = {
    apps: {
        url: "https://github.com/PolymathNetwork/polymath-apps.git",
    },
};

let logs = {
    issuer: join(logDir, "issuer.log"),
    investor: join(logDir, "investor.log"),
    offchain: join(logDir, "offchain.log"),
    ganache: join(logDir, "ganache.log"),
};

let pids = {};
let defaultBranch = 'develop';
let branch = process.env.BRANCH || process.env.TRAVIS_BRANCH || defaultBranch;
let charSep = process.platform === "win32" ? ';' : ':';
const setNodeVersion = () => {
    let path = process.env.PATH.replace(/[:;]?[^:;]*node_modules[^:;]*/g, '');
    if (path.endsWith(charSep)) path = path.substr(0, path.length - 1);
    path = `${process.env.EXTRA_PATH ? process.env.EXTRA_PATH + charSep : ''}${join(__dirname, 'node_modules', '.bin')}${charSep}${path}`;
    console.log(`Using path: ${path}`);
    return path;
}

if (!process.env.METAMASK_NETWORK || !process.env.METAMASK_SECRET) {
    console.log(`Metamask network or secret is not set, using defaults`);
    process.env.METAMASK_SECRET = "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";
    process.env.METAMASK_NETWORK = "l";
}
let mongo;

const setup = {
    git: async function (source, dir) {
        // Git mode
        let branchExists = execSync(`git ls-remote --heads ${source.url} ${branch}`, { cwd: checkoutDir }).toString();
        if (!branchExists) console.log(`Warning! Branch ${branch} doesn't exist in remote repository ${source.url}, defaulting to ${defaultBranch}`);
        else console.log(`Using branch ${branch} for ${source.url}, checking out to ${dir}`);
        if (!pathExistsSync(dir)) {
            execSync(`git clone --depth=1 --branch=${branchExists ? branch : defaultBranch} "${source.url}" "${dir}"`, { cwd: checkoutDir, stdio: 'inherit' });
        }
        else {
            execSync(`git checkout ${branchExists ? branch : defaultBranch}`, { cwd: dir, stdio: 'inherit' });
            execSync('git pull', { cwd: dir, stdio: 'inherit' });
        }
    },
    ganache: async function (baseOpts) {
        console.log('Starting ganache...');
        if (!(typeof baseOpts === 'string' || baseOpts instanceof String)) {
            let startup = process.env.NO_STARTUP;
            process.env.NO_STARTUP = true;
            baseOpts = await setup.apps(true);
            process.env.NO_STARTUP = startup;
        }
        let folder = join(baseOpts, 'packages', 'polymath-shared');
        if (!existsSync(folder))
            throw `Can't find polymath-shared`;
        let path = setNodeVersion();
        if (!process.env.NO_STARTUP) execSync('yarn', { cwd: folder, stdio: 'inherit', env: { ...process.env, PATH: path, NODE_ENV: 'development' } });
        path = `${join(folder, 'node_modules', '.bin')}${charSep}${path}`;
        let pid = exec(`yarn local-blockchain:start`, { cwd: folder, env: { ...process.env, PATH: path, NODE_ENV: 'development' } });
        let file = createWriteStream(logs.ganache);
        await new Promise((r, e) => {
            let oldWrite = file.write;
            file.write = (data, error) => {
                oldWrite.call(file, data, error);
                console.log(data);
                if (file.write != oldWrite) {
                    if (data.indexOf('Listening on') !== -1) {
                        file.write = oldWrite;
                        r();
                    }
                    if (data.indexOf('Error') !== -1) {
                        file.write = oldWrite;
                        e(data);
                    }
                }
            }
            pid.stdout.pipe(file);
            pid.stderr.pipe(file);
        });
        pids.ganache = pid;
        writeFileSync(pidsFile, Object.values(pids).map(p => p.pid).join('\n'));
        console.log(`Ganache started with pid ${pid.pid}`);
    },
    offchain: async function (baseOpts) {
        console.log('Starting offchain...');
        // TODO: Reset offchain on test end
        let folder = `${baseOpts}/packages/polymath-offchain`;
        let path = setNodeVersion();
        process.env.MONGO_DIRECTORY = join(__dirname, 'mongo');
        let db = join(checkoutDir, 'mongo');
        mkdirpSync(db);
        let mongodHelper = new MongodHelper([
            '--port', "27017",
            '--dbpath', db,
        ]);
        await mongodHelper.run().then((started) => {
            console.log('mongod is running');
            mongo = mongodHelper;
        }, (e) => {
            console.log('error starting mongodb', e);
        });
        if (!process.env.NO_STARTUP) execSync('yarn', { cwd: folder, stdio: 'inherit', env: { ...process.env, PATH: path, NODE_ENV: 'development' } });
        path = `${join(folder, 'node_modules', '.bin')}${charSep}${path}`;
        let pid = exec(`yarn start`, { cwd: folder, env: { ...process.env, PATH: path, PORT: 3001, NODE_ENV: 'development' } });
        let file = createWriteStream(logs.offchain);
        await new Promise((r, e) => {
            let oldWrite = file.write;
            file.write = (data, error) => {
                oldWrite.call(file, data, error);
                console.log(data);
                if (file.write != oldWrite) {
                    if (data.indexOf('Server is listening on port') !== -1) {
                        file.write = oldWrite;
                        r();
                    }
                    if (data.indexOf('Error') !== -1) {
                        file.write = oldWrite;
                        e(data);
                    }
                }
            }
            pid.stdout.pipe(file);
            pid.stderr.pipe(file);
        });
        pids.offchain = pid;
        writeFileSync(pidsFile, Object.values(pids).map(p => p.pid).join('\n'));
        console.log(`Offchain started with pid ${pid.pid}`);
    },
    issuer: async function (baseOpts) {
        console.log('Starting issuer...');
        let pid = exec(`node_modules/.bin/serve -s "${baseOpts}/packages/polymath-issuer/build"`, { cwd: currentDir, env: { ...process.env, PORT: 3000 } });
        let file = createWriteStream(logs.issuer);
        pid.stdout.pipe(file, { end: true });
        pid.stderr.pipe(file);
        pids.issuer = pid;
        writeFileSync(pidsFile, Object.values(pids).map(p => p.pid).join('\n'));
        console.log(`Issuer started with pid ${pid.pid}`);
    },
    investor: async function (baseOpts) {
        console.log('Starting investor...');
        let pid = exec(`node_modules/.bin/serve -s "${baseOpts}/packages/polymath-investor/build"`, { cwd: currentDir, env: { ...process.env, PORT: 3002 } });
        let file = createWriteStream(logs.investor);
        pid.stdout.pipe(file, { end: true });
        pid.stderr.pipe(file);
        pids.investor = pid;
        writeFileSync(pidsFile, Object.values(pids).map(p => p.pid).join('\n'));
        console.log(`Investor started with pid ${pid.pid}`);
    },
    apps: async function (baseOpts) {
        let folder = join(checkoutDir, 'apps');
        if (baseOpts === true) await this.git(sources.apps, folder);
        else folder = baseOpts;
        if (!process.env.SKIP_OFFCHAIN) {
            process.env.REACT_APP_POLYMATH_OFFCHAIN_ADDRESS = `http://${process.env.LOCALHOST}:3001`;
            process.env.POLYMATH_OFFCHAIN_URL = `http://${process.env.LOCALHOST}:3001`;
            process.env.POLYMATH_ISSUER_URL = `http://${process.env.LOCALHOST}:3000`;
            process.env.WEB3_NETWORK_LOCAL_WS = `ws://localhost:8545`;
            process.env.MONGODB_URI = `mongodb://localhost:27017/polymath`;
            process.env.DEPLOYMENT_STAGE = `local`;
        }
        process.env.REACT_APP_NETWORK_LOCAL_WS = `ws://${process.env.LOCALHOST}:8545`;
        if (!process.env.NO_STARTUP && existsSync(join(folder, 'package.json'))) {
            console.log('Installing apps...');
            let path = setNodeVersion();
            execSync('yarn', { cwd: folder, stdio: 'inherit', env: { ...process.env, PATH: path, NODE_ENV: 'development' } });
            path = `${join(folder, 'node_modules', '.bin')}${charSep}${path}`;
            // This should be removed in the near future
            //process.env.REACT_APP_NODE_WS = `ws://${process.env.LOCALHOST}:8545`;
            execSync('yarn build:apps', { cwd: folder, stdio: 'inherit', env: { ...process.env, PATH: path, NODE_ENV: 'development' } });
        }
        return folder;
    },
    all: function (folder) {
        deasync(async function (callback) {
            try {
                folder = await setup.apps(folder);
                await setup.ganache(folder);
                if (!process.env.SKIP_OFFCHAIN) await setup.offchain(folder);
                await setup.issuer(folder);
                await setup.investor(folder);
                callback(null);
            } catch (error) {
                callback(error);
            }
        })();
    }
}

if (argv.params.setup.ganache) {
    deasync(async function (callback) {
        try {
            await setup.ganache(argv.params.setup.ganache);
            callback(null);
        } catch (error) {
            callback(error);
        }
    })();
} else if (argv.params.setup.apps) {
    setup.all(argv.params.setup.apps);
} else {
    throw `Unknown parameter for setup ${JSON.stringify(argv.params.setup)}`;
}

const kill = () => {
    if (mongo) {
        mongo.closeHandler(0);
        mongo = null;
    }
    if (!pids) return;
    console.log('Killing processes...');
    for (let process in pids)
        try { deasync(r => treeKill(pids[process].pid, 'SIGKILL', r))(); } catch (error) { }
    pids = null;
    removeSync(pidsFile);
    if (process.env.PRINT_LOGS) for (let log in logs) {
        console.log(`Printing output of ${log}: ${log[logs]}`);
        console.log(readFileSync(log[logs], 'utf8'));
    }
};
process.on('SIGINT', function () {
    console.log("Caught interrupt signal, exiting...");
    kill();
});
process.on('exit', function () {
    kill();
});
module.exports = kill;
console.log(`Setup complete, started the following processes: ${Object.entries(pids).map(e => e[0] + ': ' + e[1].pid).join(', ')}
Press Ctrl+C to terminate them.`);