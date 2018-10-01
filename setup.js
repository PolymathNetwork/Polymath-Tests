const { join } = require('path');
const { mkdirpSync, removeSync, readFileSync, pathExistsSync, writeFileSync, existsSync, createWriteStream } = require('fs-extra');
const { argv } = require('yargs');
const { execSync, exec } = require('child_process');
const deasync = require('deasync');
const treeKill = require('tree-kill');
const contractParser = require('./parse');
const { extract } = require('tar-fs');
const { sync } = require('glob');

if (!argv.params || !argv.params.setup || !(argv.params.setup === true || argv.params.setup instanceof Object)) {
    throw `Usage: setup.js [--ganache] [--issuer <path>] [--investor <path>] [--offchain <path>]
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
if (!process.env.NO_DELETE_ENV) removeSync(checkoutDir);
mkdirpSync(checkoutDir);
let logDir = process.env.LOG_DIR || join(currentDir, 'logs');
mkdirpSync(logDir);
let ganacheDb = join(checkoutDir, "ganache.db");

let sources = {
    ganache: {
        url: "https://github.com/PolymathNetwork/polymath-core.git",
        npm: 'polymath-core'
    },
    apps: {
        url: "https://github.com/PolymathNetwork/polymath-apps.git",
        npm: 'polymath-apps'
    },
};

let logs = {
    issuer: join(logDir, "issuer.log"),
    investor: join(logDir, "investor.log"),
    offchain: join(logDir, "offchain.log"),
    migration: join(logDir, "migration.log"),
    ganache: join(logDir, "ganache.log"),
};

let pids = {};
let branch = process.env.BRANCH || process.env.TRAVIS_BRANCH || 'master';
const setNodeVersion = () => {
    let path = process.env.PATH.replace(/:?[^:]*node_modules[^:]*/g, '');
    if (path.endsWith(':')) path = path.substr(0, path.length - 1);
    return `${join(__dirname, 'node_modules', '.bin')}:${path}`;
}

if (!process.env.GANACHE_PORT) process.env.GANACHE_PORT = 8545;
if (!process.env.GANACHE_NETWORK) process.env.GANACHE_NETWORK = 100000015;
if (!process.env.GANACHE_GAS) process.env.GANACHE_GAS = 9000000;
if (!process.env.METAMASK_NETWORK || !process.env.METAMASK_SECRET) {
    console.log(`Metamask network or secret is not set, using defaults`);
    process.env.METAMASK_SECRET = "cotton trap squeeze wealth aunt fork hungry notice entry early combine chalk";
    process.env.METAMASK_NETWORK = "l";
}
if (process.env.METAMASK_NETWORK.startsWith('l')) process.env.REACT_APP_NODE_WS = `ws://${process.env.LOCALHOST}:${process.env.GANACHE_PORT}`;

const setup = {
    git: async function (source, dir, useNpm) {
        if (!useNpm) {
            // Git mode
            let branchExists = execSync(`git ls-remote --heads ${source.url} ${branch}`, { cwd: checkoutDir }).toString();
            if (!branchExists) console.log(`Warning! Branch ${branch} doesn't exist in remote repository ${source.url}, defaulting to master`);
            else console.log(`Using branch ${branch} for ${source.url}, checking out to ${dir}`);
            if (!pathExistsSync(dir)) {
                execSync(`git clone --depth=1 --branch=${branchExists ? branch : 'master'} "${source.url}" "${dir}"`, { cwd: checkoutDir, stdio: 'inherit' });
            }
            else {
                execSync(`git checkout ${branchExists ? branch : 'master'}`, { cwd: dir, stdio: 'inherit' });
                execSync('git pull', { cwd: dir, stdio: 'inherit' });
            }
        } else {
            mkdirpSync(dir);
            execSync(`npm pack ${source.npm}`, { cwd: dir, stdio: 'inherit' });
            for (let file of sync("*.tgz", { cwd: dir })) {
                extract(file, { strip: 1 });
            }
        }
    },
    ganache: async function (baseOpts) {
        let useNpm = true;
        let useGit = true;
        if (baseOpts === false) {
            useNpm = false;
        }
        else if (baseOpts !== undefined) {
            useGit = false;
        }
        console.log('Starting ganache...');
        let folder = join(checkoutDir, 'ganache');
        if (useGit) this.git(sources.ganache, folder, useNpm);
        else folder = join(baseOpts, 'node_modules', 'polymath-core');
        // Can only be installed via npm install
        removeSync(join(folder, 'yarn.lock'));
        removeSync(join(folder, 'package-lock.json'));
        removeSync(join(folder, 'node-modules'));
        let path = setNodeVersion();
        execSync('npm install', { cwd: folder, stdio: 'inherit', env: { ...process.env, PATH: path } });
        removeSync(ganacheDb);
        mkdirpSync(ganacheDb);
        // TODO: Reset ganache on test end
        let file = readFileSync(join(folder, 'truffle.js'), 'utf8');
        file = file.replace(/(development: {[^}]*})/,
            `development: { host: 'localhost', network_id: '${process.env.GANACHE_NETWORK}', port: ${process.env.GANACHE_PORT}, gas: ${process.env.GANACHE_GAS} }`);
        writeFileSync(join(folder, 'truffle.js'), file);
        console.log('Waiting for ganache to be available...');
        let pid = exec(`node_modules/.bin/ganache-cli -e 100000 -i ${process.env.GANACHE_NETWORK} -l ${process.env.GANACHE_GAS} --db "${ganacheDb}" -p ${process.env.GANACHE_PORT} -m "${process.env.METAMASK_SECRET}"`, { cwd: folder, env: { ...process.env, PATH: path } });
        let file = createWriteStream(logs.ganache);
        pid.stdout.pipe(file, { end: true });
        pid.stderr.pipe(file);
        await new Promise((r, e) => {
            let waitForInput = function (data) {
                console.log(data);
                if (data.indexOf('Listening on') !== -1) {
                    pid.stdout.removeListener('data', waitForInput);
                    r();
                }
                if (data.indexOf('Error') !== -1) {
                    e(data);
                }
            }
            pid.stdout.on('data', waitForInput);
        });
        pids.ganache = pid;
        writeFileSync(pidsFile, Object.values(pids).map(p => p.pid).join('\n'));
        console.log(`Migrating contracts...`);
        let contracts = execSync(`node_modules/.bin/truffle migrate --reset --all --network development`, { cwd: folder, env: { ...process.env, PATH: path } }).toString();
        writeFileSync(logs.migration, contracts);
        console.log(contracts);
        contracts = JSON.stringify(contractParser(contracts));
        process.env.GANACHE_CONTRACTS = contracts;
        console.log(`Contracts identified as:\n${process.env.GANACHE_CONTRACTS}`);
        console.log(`Ganache started with pid ${pid.pid}`);
    },
    offchain: async function (baseOpts) {
        console.log('Starting offchain...');
        // TODO: Reset offchain on test end
        let pid = exec(`PORT=3001 node_modules/.bin/serve -s "${baseOpts}/packages/polymath-offchain/build"`);
        let file = createWriteStream(logs.offchain);
        pid.stdout.pipe(file, { end: true });
        pid.stderr.pipe(file);
        pids.offchain = pid;
        writeFileSync(pidsFile, Object.values(pids).map(p => p.pid).join('\n'));
        console.log(`Offchain started with pid ${pid.pid}`);
    },
    issuer: async function (baseOpts) {
        console.log('Starting issuer...');
        let pid = exec(`PORT=3000 node_modules/.bin/serve -s "${baseOpts}/packages/polymath-issuer/build"`);
        let file = createWriteStream(logs.issuer);
        pid.stdout.pipe(file, { end: true });
        pid.stderr.pipe(file);
        pids.issuer = pid;
        writeFileSync(pidsFile, Object.values(pids).map(p => p.pid).join('\n'));
        console.log(`Issuer started with pid ${pid.pid}`);
    },
    investor: async function (baseOpts) {
        console.log('Starting investor...');
        let pid = exec(`PORT=3002 node_modules/.bin/serve -s "${baseOpts}/packages/polymath-investor/build"`);
        let file = createWriteStream(logs.investor);
        pid.stdout.pipe(file, { end: true });
        pid.stderr.pipe(file);
        pids.investor = pid;
        writeFileSync(pidsFile, Object.values(pids).map(p => p.pid).join('\n'));
        console.log(`Investor started with pid ${pid.pid}`);
    },
    apps: async function (baseOpts) {
        let folder = join(checkoutDir, 'apps');
        if (!baseOpts) this.git(sources.apps, folder, false);
        else folder = baseOpts;
        if (existsSync(join(folder, 'package.json'))) {
            console.log('Installing apps...');
            let path = setNodeVersion();
            execSync('yarn', { cwd: folder, stdio: 'inherit', env: { ...process.env, PATH: path, NODE_ENV: 'development' } });
            process.env.REACT_APP_POLYMATH_OFFCHAIN_ADDRESS = `http://${process.env.LOCALHOST}:3001`
            execSync('yarn build:apps', { cwd: folder, stdio: 'inherit', env: { ...process.env, PATH: path, NODE_ENV: 'development' } });
        }
        return folder;
    },
    all: function (folder) {
        deasync(async function (callback) {
            try {
                folder = await setup.apps(folder);
                await setup.offchain(folder);
                await setup.issuer(folder);
                await setup.investor(folder);
                await setup.ganache(folder);
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
    throw `Unknown paramater for setup ${JSON.stringify(argv.params.setup)}`;
}
console.log(`Setup complete, started the following processes: ${Object.entries(pids).map(e => e[0] + ': ' + e[1].pid)}
Press Ctrl+C to terminate them.`);

const kill = () => {
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