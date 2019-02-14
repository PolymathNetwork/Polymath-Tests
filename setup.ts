import { resolve } from 'path';
import { mkdirpSync, removeSync, readFileSync, pathExistsSync, writeFileSync, existsSync, createWriteStream, copySync } from 'fs-extra';
import { argv } from 'yargs';
import { execSync, exec, ChildProcess } from 'child_process';
import deasync = require('deasync');
import treeKill = require('tree-kill');
import { MongodHelper } from '@josepmc/mongodb-prebuilt';
import findProcess = require('find-process');

export enum Process {
    Investor = 1,
    Issuer = 2,
    Offchain = 4,
    Ganache = 8,
    All = Investor | Issuer | Offchain | Ganache
}

enum GanacheStatus {
    WaitingForAccounts,
    DumpingAccounts,
    DumpingPK,
    WaitingForGanacheToStart,
    WaitingForScriptToFinish,
    ScriptFinished
}

export class Setup {
    private currentDir = __dirname;
    private checkoutDir = process.env.TEST_CHECKOUT_DIR || resolve(__dirname, 'git-checkout');
    private pidsFile = resolve(this.checkoutDir, 'pids.pid');
    private sources = {
        apps: {
            url: "https://github.com/PolymathNetwork/polymath-apps.git",
        },
    };
    private logDir = process.env.TEST_LOG_DIR || resolve(this.currentDir, 'logs');
    private logs = {
        issuer: resolve(this.logDir, "issuer.log"),
        investor: resolve(this.logDir, "investor.log"),
        offchain: resolve(this.logDir, "offchain.log"),
        ganache: resolve(this.logDir, "ganache.log"),
    };
    private pids: { [k: string]: { type: Process, pid: ChildProcess } } = {};
    public isRunning(proc?: Process): boolean {
        return Object.entries(this.pids)
            .filter(val => !proc || (val[1].type & proc)) != null;
    }
    private defaultBranch = 'develop';
    private branch = process.env.TEST_BRANCH || process.env.TRAVIS_BRANCH || this.defaultBranch;
    private charSep = process.platform === "win32" ? ';' : ':';
    private mongo: MongodHelper;
    private setNodeVersion() {
        let path = process.env.PATH.replace(/[:;]?[^:;]*node_modules[^:;]*/g, '');
        if (path.endsWith(this.charSep)) path = path.substr(0, path.length - 1);
        path = `${process.env.TEST_EXTRA_PATH ? process.env.TEST_EXTRA_PATH + this.charSep : ''}${resolve(__dirname, 'node_modules', '.bin')}${this.charSep}${path}`;
        console.log(`Using path: ${path}`);
        return path;
    }
    public cleanup() {
        console.log('Performing cleanup...');
        if (existsSync(this.pidsFile)) {
            for (let p of readFileSync(this.pidsFile, 'utf8').split('\n')) {
                try { deasync(r => treeKill(parseInt(p), 'SIGKILL', r))(); } catch (error) { }
            }
            removeSync(this.pidsFile);
        }
        if (process.env.TEST_COVERAGE !== "false") process.env.TEST_COVERAGE = "true";
        if (!process.env.TEST_NO_DELETE_ENV) removeSync(this.checkoutDir);
        mkdirpSync(this.checkoutDir);
        mkdirpSync(this.logDir);
        if (!process.env.TEST_MM_NETWORK || !process.env.TEST_MM_SECRET) {
            console.log(`Metamask network or secret is not set, using defaults`);
            process.env.TEST_MM_SECRET = "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";
            process.env.TEST_MM_NETWORK = "l";
        }
    }
    public async findAndKill(port: number) {
        let proc = await findProcess('port', port);
        for (let p of proc) {
            console.log(`Killing process '${p.cmd}' as it's using port ${port}`);
            process.kill(p.pid, 'SIGKILL');
        }
    }
    public kill(proc: Process = Process.All) {
        if (this.mongo && (proc & Process.Offchain)) {
            this.mongo.closeHandler(0);
            this.mongo = null;
        }
        if (!this.pids || !Object.entries(this.pids).filter(el => el[1].type & proc).length) return false;
        let previousLength = Object.keys(this.pids).length;
        console.log('Killing processes...');
        for (let pr in this.pids) {
            if (this.pids[pr].type & proc) {
                console.log(`Terminating ${Process[this.pids[pr].type]}...`);
                try {
                    treeKill(this.pids[pr].pid.pid, 'SIGKILL');
                    delete this.pids[pr];
                } catch (error) {
                    console.log(`Error while terminating process ${Process[pr]}: ${error}`);
                }
            }
        }
        let newLength = Object.keys(this.pids).length;
        if (previousLength === newLength) {
            console.error(`Didn't kill any processes`);
            return false;
        }
        if (!newLength) {
            // All of them have been killed
            this.pids = {};
            removeSync(this.pidsFile);
            if (process.env.TEST_PRINT_LOGS) for (let log in this.logs) {
                console.log(`Printing output of ${log}: ${this.logs[log]}`);
                console.log(readFileSync(this.logs[log], 'utf8'));
            }
        } else {
            // Write the new paradigm
            writeFileSync(this.pidsFile, Object.values(this.pids).map(p => p.pid).join('\n'));
        }
        return true;
    };

    // Setup Area
    public async git(source: { url: string; }, dir: string) {
        // Git mode
        let branchExists = execSync(`git ls-remote --heads ${source.url} ${this.branch}`, { cwd: this.checkoutDir }).toString();
        if (!branchExists) console.log(`Warning! Branch ${this.branch} doesn't exist in remote repository ${source.url}, defaulting to ${this.defaultBranch}`);
        else console.log(`Using branch ${this.branch} for ${source.url}, checking out to ${dir}`);
        if (!pathExistsSync(dir)) {
            execSync(`git clone --depth=1 --branch=${branchExists ? this.branch : this.defaultBranch} "${source.url}" "${dir}"`, { cwd: this.checkoutDir, stdio: 'inherit' });
        }
        else {
            execSync(`git checkout ${branchExists ? this.branch : this.defaultBranch}`, { cwd: dir, stdio: 'inherit' });
            execSync('git pull', { cwd: dir, stdio: 'inherit' });
        }
    }
    public ganacheFolder: string;
    public accounts: { [k: number]: { address?: string, pk?: string } } = {};
    public async ganache(opts: { folder: string | boolean, config?: string }) {
        console.log('Starting ganache...');
        let baseOpts = opts.folder;
        if (!(typeof baseOpts === 'string')) {
            process.env.TEST_NO_BUILD = "true";
            baseOpts = await this.apps({ folder: true });
        }
        let path = this.setNodeVersion();
        await this.findAndKill(8545);
        /*let folder = resolve(baseOpts, 'packages', 'new-polymath-scripts');
        if (!existsSync(folder))
            throw `Can't find new-polymath-scripts`;
        if (!process.env.TEST_NO_STARTUP) execSync('yarn --network-timeout=100000', { cwd: folder, stdio: 'inherit', env: { ...process.env, PATH: path, NODE_ENV: 'development' } });
        path = `${resolve(folder, 'node_modules', '.bin')}${this.charSep}${path}`;*/
        path = `${resolve(baseOpts, 'node_modules', '.bin')}${this.charSep}${path}`;
        console.log(`Using path: ${path}`);
        let pid = exec(`yarn local-blockchain:start ${opts.config ? `--seedData "${opts.config}" -e 1000000` : ''}`, { cwd: baseOpts, env: { ...process.env, PATH: path, NODE_ENV: 'development' } });
        let file = createWriteStream(this.logs.ganache);
        await new Promise((r, e) => {
            let oldWrite = file.write;
            let accountRegex = /\((\d)\) (0x[a-f0-9A-F]+)/;
            let status: GanacheStatus = GanacheStatus.WaitingForAccounts;
            file.write = (data: { indexOf: { (arg0: string): number; (arg0: string): number; }; toLowerCase: () => { indexOf: (arg0: string) => number; }; }, error: any): boolean => {
                let res = oldWrite.call(file, data, error);
                console.log(data);
                if (file.write != oldWrite) {
                    if (data.toLowerCase().indexOf('error') !== -1) {
                        file.write = oldWrite;
                        console.error(`Error while starting ganache on stage ${GanacheStatus[status]}`);
                        e(data);
                    }
                    for (let input of data.toString().split('\n')) {
                        switch (status) {
                            case GanacheStatus.WaitingForAccounts:
                                if (input.indexOf('Available Accounts') !== -1) {
                                    status = GanacheStatus.DumpingAccounts;
                                }
                                break;
                            case GanacheStatus.DumpingAccounts:
                                if (input.indexOf('Private Keys') !== -1) {
                                    status = GanacheStatus.DumpingPK;
                                } else if (accountRegex.test(input.toString())) {
                                    let match = accountRegex.exec(input.toString());
                                    let accNumber = parseInt(match[1]);
                                    this.accounts[accNumber] = this.accounts[accNumber] || {};
                                    this.accounts[accNumber].address = match[2];
                                }
                                break;
                            case GanacheStatus.DumpingPK:
                                if (input.indexOf('HD Wallet') !== -1) {
                                    status = GanacheStatus.WaitingForGanacheToStart;
                                } else if (accountRegex.test(input.toString())) {
                                    let match = accountRegex.exec(input.toString());
                                    let accNumber = parseInt(match[1]);
                                    this.accounts[accNumber] = this.accounts[accNumber] || {};
                                    this.accounts[accNumber].pk = match[2];
                                }
                                break;
                            case GanacheStatus.WaitingForGanacheToStart:
                                if (input.indexOf('Listening on') !== -1) {
                                    status = GanacheStatus.WaitingForScriptToFinish;
                                    console.log(`Ganache is listening on ${input}, waiting for init script to finish...`);
                                }
                                break;
                            case GanacheStatus.WaitingForScriptToFinish:
                                if (input.indexOf('child process exited with code') !== -1) {
                                    status = GanacheStatus.ScriptFinished;
                                    file.write = oldWrite;
                                    r();
                                }
                                break;
                        }
                    }
                }
                return res;
            }
            pid.stdout.pipe(file);
            pid.stderr.pipe(file);
        });
        this.pids.ganache = {
            pid: pid, type: Process.Ganache
        };
        writeFileSync(this.pidsFile, Object.values(this.pids).map(p => p.pid).join('\n'));
        console.log(`Ganache started with pid ${pid.pid}`);
        this.ganacheFolder = baseOpts;
    }
    public async offchain(baseOpts: string) {
        console.log('Starting offchain...');
        // TODO: Reset offchain on test end
        let folder = `${baseOpts}/packages/polymath-offchain`;
        let path = this.setNodeVersion();
        process.env.TEST_MONGO_DIRECTORY = resolve(__dirname, 'mongo');
        let port = 3001;
        await this.findAndKill(port);
        let db = resolve(this.checkoutDir, 'mongo');
        mkdirpSync(db);
        let mongodHelper = new MongodHelper([
            '--port', "27017",
            '--dbpath', db,
        ]);
        await mongodHelper.run().then((started) => {
            console.log('mongod is running');
            this.mongo = mongodHelper;
        }, (e) => {
            console.log('error starting mongodb', e);
        });
        if (!process.env.TEST_NO_STARTUP) execSync('yarn --network-timeout=100000', { cwd: folder, stdio: 'inherit', env: { ...process.env, PATH: path, NODE_ENV: 'development' } });
        path = `${resolve(folder, 'node_modules', '.bin')}${this.charSep}${path}`;
        path = `${resolve(baseOpts, 'node_modules', '.bin')}${this.charSep}${path}`;
        console.log(`Using path: ${path}`);
        let pid = exec(`yarn start`, { cwd: folder, env: { ...process.env, PATH: path, PORT: `${port}`, NODE_ENV: 'development' } });
        let file = createWriteStream(this.logs.offchain);
        await new Promise((r, e) => {
            let oldWrite = file.write;
            file.write = (data: { indexOf: (arg0: string) => number; toLowerCase: () => { indexOf: (arg0: string) => number; }; }, error: any): boolean => {
                let res = oldWrite.call(file, data, error);
                console.log(data);
                if (file.write != oldWrite) {
                    if (data.indexOf('Server is listening on port') !== -1) {
                        file.write = oldWrite;
                        r();
                    }
                    if (data.toLowerCase().indexOf('error') !== -1) {
                        file.write = oldWrite;
                        e(data);
                    }
                }
                return res;
            }
            pid.stdout.pipe(file);
            pid.stderr.pipe(file);
        });
        this.pids.offchain = {
            pid: pid, type: Process.Offchain
        };
        writeFileSync(this.pidsFile, Object.values(this.pids).map(p => p.pid).join('\n'));
        console.log(`Offchain started with pid ${pid.pid}`);
    }
    private async issuer(baseOpts: string) {
        console.log('Starting issuer...');
        let port = 3000;
        await this.findAndKill(port);
        let pid = exec(`yarn serve -s "${baseOpts}/packages/polymath-issuer/build"`, { cwd: this.currentDir, env: { ...process.env, PORT: `${port}` } });
        let file = createWriteStream(this.logs.issuer);
        pid.stdout.pipe(file);
        pid.stderr.pipe(file);
        this.pids.issuer = {
            pid: pid, type: Process.Issuer
        };
        writeFileSync(this.pidsFile, Object.values(this.pids).map(p => p.pid).join('\n'));
        console.log(`Issuer started with pid ${pid.pid}`);
    }
    public async investor(baseOpts: string) {
        console.log('Starting investor...');
        let port = 3002;
        await this.findAndKill(port);
        let pid = exec(`yarn serve -s "${baseOpts}/packages/polymath-investor/build"`, { cwd: this.currentDir, env: { ...process.env, PORT: `${port}` } });
        let file = createWriteStream(this.logs.investor);
        pid.stdout.pipe(file);
        pid.stderr.pipe(file);
        this.pids.investor = {
            pid: pid, type: Process.Investor
        };
        writeFileSync(this.pidsFile, Object.values(this.pids).map(p => p.pid).join('\n'));
        console.log(`Investor started with pid ${pid.pid}`);
    }
    public cliDir: string;
    public async apps(baseOpts: { folder: string | boolean }) {
        let folder = resolve(this.checkoutDir, 'apps');
        if (baseOpts.folder === true) await this.git(this.sources.apps, folder);
        else folder = baseOpts.folder as string;
        folder = resolve(folder);
        if (!process.env.TEST_SKIP_OFFCHAIN) {
            process.env.REACT_APP_POLYMATH_OFFCHAIN_ADDRESS = `http://${process.env.TEST_LOCALHOST}:3001`;
            process.env.POLYMATH_OFFCHAIN_URL = `http://${process.env.TEST_LOCALHOST}:3001`;
            process.env.POLYMATH_ISSUER_URL = `http://${process.env.TEST_LOCALHOST}:3000`;
            process.env.WEB3_NETWORK_LOCAL_WS = `ws://localhost:8545`;
            process.env.TEST_MONGODB_URI = `mongodb://localhost:27017/polymath`;
            process.env.REACT_APP_DEPLOYMENT_STAGE = `local`;
        }
        process.env.REACT_APP_NETWORK_LOCAL_WS = `ws://${process.env.TEST_LOCALHOST}:8545`;
        if (!process.env.TEST_NO_STARTUP && existsSync(resolve(folder, 'package.json'))) {
            console.log('Installing apps...');
            let path = this.setNodeVersion();
            execSync('yarn --network-timeout=100000 --frozen-lockfile', { cwd: folder, stdio: 'inherit', env: { ...process.env, PATH: path, NODE_ENV: 'development' } });
            let coreFolder = process.env.TEST_CLI_DIR || `${folder}/node_modules/@polymathnetwork/polymath-scripts/node_modules/polymath-core/CLI`;
            if (existsSync(coreFolder)) {
                // Set up CLI
                console.log('Installing CLI dependencies...');
                let finalFolder = resolve(folder, 'build');
                this.cliDir = resolve(finalFolder, 'CLI');
                let fixturesFolder = `${folder}/packages/new-polymath-scripts/src/fixtures`;
                removeSync(finalFolder);
                mkdirpSync(finalFolder);
                copySync(coreFolder, this.cliDir);
                copySync(fixturesFolder, resolve(finalFolder, 'build'));
                execSync('yarn --network-timeout=100000 --frozen-lockfile', { cwd: this.cliDir, stdio: 'inherit', env: { ...process.env, PATH: path, NODE_ENV: 'development' } });
            }
            else {
                throw `CLI dependencies not found: *tests won't work*.
                Please configure TEST_CLI_DIR accordingly (actual value is: ${process.env.TEST_CLI_DIR}).`;
            }
            //path = `${resolve(folder, 'node_modules', '.bin')}${this.charSep}${path}`;
            // This should be removed in the near future
            //process.env.REACT_APP_NODE_WS = `ws://${process.env.TEST_LOCALHOST}:8545`;
            //if (!process.env.TEST_NO_BUILD) execSync('yarn build:apps', { cwd: folder, stdio: 'inherit', env: { ...process.env, PATH: path, NODE_ENV: 'development' } });
        }
        return folder;
    }
    public async all(folder: string) {
        folder = await this.apps({ folder: folder });
        await this.ganache({ folder: folder });
        if (!process.env.TEST_SKIP_OFFCHAIN) await this.offchain(folder);
        await this.issuer(folder);
        await this.investor(folder);
    }
    private _registered = false;
    public register() {
        if (this._registered) return;
        this._registered = true;
        let self = this;
        process.on('SIGINT', function () {
            console.log("Caught interrupt signal, exiting...");
            self.kill();
            process.exit(0);
        });
        process.on('exit', function () {
            self.kill();
        });
    }
    private constructor() { }
    private static _instance: Setup;
    public static get instance(): Setup {
        return Setup._instance || (Setup._instance = new Setup());
    }
}

if (argv.$0 === 'setup.ts') {
    if (!argv.ganache && !argv.apps) {
        throw `Usage: setup.js [--ganache] [--apps=[apps directory]]
        All parameters are mutually exclusive`;
    }
    deasync(async function (callback) {
        let setup = Setup.instance;
        await setup.cleanup();
        await setup.register();
        try {
            if (argv.ganache) {
                await setup.ganache(argv.ganache);
            } else if (argv.apps) {
                await setup.all(argv.apps);
            }
            callback(null);
        } catch (error) {
            callback(error);
        }
    })();
}