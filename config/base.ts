import { PuppeteerHandle } from 'framework/object/wrapper/puppeteer';
import { Arguments, argv as BaseArguments } from 'yargs';
import { RunnerConfig } from './definition';
import { ExtensionManager, ExtensionBrowser, ExtensionData, ExtensionInfo, ExtensionConfig } from 'extensions';
import * as deasync from 'deasync';
import { readFileSync } from 'fs';
import { assert, TestConfig } from 'framework/helpers';
import { CloudDownloadManager, LocalDownloadManager } from './download';
import cbt = require('cbt_tunnels');
import { join } from 'path';
import { UploadProvider } from './uploadProviders';
import { mkdirpSync, moveSync } from 'fs-extra';
import { Config } from 'imap';
let localhost = process.env.TEST_LOCALHOST || 'localhost';
const debugMode = process.env.IS_DEBUG;
const reportsDir = process.env.TEST_REPORTS_DIR || join(__dirname, '..', 'reports');
process.env.TEST_LOG_DIR = join(reportsDir, 'logs');
if (!process.env.SELENIUM_DIR) process.env.SELENIUM_DIR = join(__dirname, '..', '.webdriver');

mkdirpSync(reportsDir);

process.on('uncaughtException', function (err) {
    console.error((err && err.stack) ? err.stack : err);
    debugger;
    process.exit(1);
});

class Environment {
    public argv: Arguments = BaseArguments;
    public config: RunnerConfig;
    constructor(private opts = { params: {} }) {
        this.argv = {
            ...opts,
            ...this.argv,
            params: {
                ...(opts && opts.params),
                ...(this.argv && this.argv).params
            },
        }
    }
}
// email configuration
let match = /.*@(.*)/.exec(process.env.TEST_EMAIL_USER);
let emailServer = match && match.length === 2 ? match[1] : '';
let emailConfig: Config = {
    user: process.env.TEST_EMAIL_USER,
    password: process.env.TEST_EMAIL_PASSWORD,
    port: 993,
    tls: true
}
switch (emailServer) {
    case 'gmail.com':
        emailConfig = {
            ...emailConfig,
            host: "imap.gmail.com",
        };
        break;
    case 'outlook.com':
        emailConfig = {
            ...emailConfig,
            host: "imap-mail.outlook.com",
        };
        break;
    default:
        console.warn(`Unknown email domain ${emailServer}, email fetching WON'T WORK`);
}

const environments = function (): { [k: string]: RunnerConfig } {
    return {
        local: {
            baseUrl: `http://${localhost}:3000`,
            apps: {
                investor: `http://${localhost}:3002`,
            },
            emailConfig: emailConfig,
            dbConfig: {
                mongo: process.env.TEST_MONGODB_URI || `mongodb://localhost:27017/polymath`
            }
        },
        develop: {
            baseUrl: `http://polymath-issuer-develop.netlify.com`,
            apps: {
                investor: `http://polymath-investor-staging.netlify.com`,
            },
            emailConfig: emailConfig
        },
        beta: {
            baseUrl: `http://betastudio.polymath.network`,
            apps: {
                investor: ``,
            },
            emailConfig: emailConfig
        },
        production: {
            baseUrl: 'https://tokenstudio.polymath.network',
            apps: {
                investor: ``,
            },
            emailConfig: emailConfig
        }
    }
}

// TODO: Migrate to TestConfig
let shutdownFns: (() => Promise<void> | void)[] = [];
let shutdownDone: boolean = false;
const shutdown = async function () {
    if (shutdownDone) return true;
    shutdownDone = true;
    let hasError = false;
    await TestConfig.shutdown();
    for (let fn of shutdownFns) {
        try {
            await fn();
        }
        catch (error) {
            hasError = true;
            console.log(`Error ocurred on shutdown: ${error}`);
        }
    }
    return !hasError;
}

process.on('exit', () => {
    if (!shutdownDone) deasync(async function (callback) {
        callback(!(await shutdown()));
    })();
});

const getExtensions = function (env: string[], browser: ExtensionBrowser): { info: ExtensionInfo, data: ExtensionData, config: ExtensionConfig }[] {
    let res: { info: ExtensionInfo, data: ExtensionData, config: ExtensionConfig }[] = []
    if (env) {
        if (!(env instanceof Array)) env = [env];
        res = [];
        let extensions = ExtensionManager.GetExtensions(browser);
        for (let ex of env) {
            let install = extensions.find(e => e.name.toLowerCase() === ex.toLowerCase());
            if (!install) throw `Couldn't find ${ex} for ${ExtensionBrowser[browser]}`;
            console.log(`Loading ${install.name} for ${ExtensionBrowser[browser]}`);
            let extension = new install.extension();
            let data: ExtensionData = deasync(cb => extension.getExtension(browser).then(res => cb(null, res)))();
            if (!data) {
                console.warn(`No extension '${install.name}' installed for ${ExtensionBrowser[browser]}`);
                continue;
            }
            console.log(`Loaded ${install.name} for ${ExtensionBrowser[browser]}`);
            res.push({ info: install, data: data, config: extension.getConfig() });
            if (data.afterExecution) shutdownFns.push(data.afterExecution);
        }
    }
    return res;
}

export = (opts = { params: {} }) => {
    try {
        let currentEnv = new Environment(opts);
        const setup = () => {
            if (currentEnv.argv.params && currentEnv.argv.params.setup) {
                // We put it into a function so that localhost and the parameters can be modified
                try {
                    process.env.TEST_LOCALHOST = localhost;
                    let kill = require('../setup');
                    shutdownFns.push(async () => {
                        await kill();
                    });
                } catch (error) {
                    console.error(`An error ocurred while setting up the project: ${error}`);
                    throw error;
                }
            }
        };
        currentEnv.config = {
            allScriptsTimeout: debugMode ? 60 * 60 * 1000 : 4 * 60 * 1000,
            specs: process.env.TEST_SPECS || currentEnv.argv.specs || ['tests/**/*.feature'],
            SELENIUM_PROMISE_MANAGER: false,
            disableChecks: true,
            noGlobals: true,
            restartBrowserBetweenTests: false,
            ignoreUncaughtExceptions: true,
            framework: 'custom',
            frameworkPath: require.resolve('protractor-cucumber-framework'),
            localhost: localhost,
            cucumberOpts: {
                compiler: './config/register',
                require: [
                    './config/cucumber-setup.ts',
                    './extensions/**/*.ts',
                    './objects/**/*.ts',
                    './tests/**/*.ts',
                ],
                tags: process.env.TEST_TAGS || currentEnv.argv.params.tags || '',
                // TODO: Add multiple formats (e.g. html)
                format: 'node_modules/cucumber-pretty'
            },
            extensions: {
            },
            beforeLaunch: async function () {
                await UploadProvider.init();
            },
            resultJsonOutputFile: join(reportsDir, 'protractor.json'),
            afterLaunch: async function () {
                await shutdown();
                // Upload to the service providers
                await UploadProvider.upload(reportsDir);
            },
            params: {
                ...currentEnv.argv.params,
                reportPath: reportsDir,
                generatorSeed: currentEnv.argv.seed || (Math.random() * Number.MAX_SAFE_INTEGER),
            },
            ...environments()[process.env.TEST_ENV || currentEnv.argv.env || 'local']
        };
        let browserString = process.env.TEST_BROWSER || (currentEnv.argv.params.browser && currentEnv.argv.params.browser.toLowerCase()) || 'puppeteer';
        let extensionsString = process.env.TEST_EXTENSIONS || currentEnv.argv.params.extensions;
        switch (browserString) {
            case 'puppeteer': {
                setup();
                let extensions = getExtensions(extensionsString, ExtensionBrowser.Chrome);
                let dlmgr = new LocalDownloadManager();
                let pup = new PuppeteerHandle({
                    // We can't run chrome in headless when using extensions
                    headless: false,
                    // If we're using command line flags, we can only pass uncompressed directories
                    extensions: extensions.map(ex => ex.data.uncompressed),
                    downloadManager: dlmgr,
                });
                let ext = {};
                for (let ex of extensions) ext[ex.config.key] = ex.config.config;
                currentEnv.config.capabilities = {
                    directConnect: true,
                    extraConfig: {
                        extensions: ext,
                        downloadManager: dlmgr.getConfig(),
                    },
                    browserName: 'chrome',
                    chromeOptions: {
                        debuggerAddress: pup.address
                    }
                }
                break;
            }
            case 'chrome': {
                setup();
                let extensions = getExtensions(extensionsString, ExtensionBrowser.Chrome);
                let dlmgr = new LocalDownloadManager();
                let ext = {};
                for (let ex of extensions) ext[ex.config.key] = ex.config.config;
                currentEnv.config.capabilities = {
                    directConnect: true,
                    extraConfig: {
                        extensions: ext,
                        downloadManager: dlmgr.getConfig(),
                    },
                    browserName: 'chrome',
                    chromeOptions: {
                        // Webdriver requires .crx files
                        extensions: extensions
                            .map(ex => readFileSync(ex.data.file, 'base64')),
                    },
                    prefs: {
                        "profile.default_content_settings.cookies": 0,
                        'download': {
                            'prompt_for_download': false,
                            'default_directory': dlmgr.downloadPath(),
                            'directory_upgrade': true
                        },
                        browser: {
                            set_download_behavior: {
                                behavior: 'allow'
                            }
                        }
                    }
                }
                break;
            }
            case 'chromium': {
                setup();
                let extensions = getExtensions(extensionsString, ExtensionBrowser.Chrome);
                let dlmgr = new LocalDownloadManager();
                let ext = {};
                for (let ex of extensions) ext[ex.config.key] = ex.config.config;
                currentEnv.config.capabilities = {
                    directConnect: true,
                    extraConfig: {
                        extensions: ext,
                        downloadManager: dlmgr.getConfig(),
                    },
                    browserName: 'chrome',
                    chromeOptions: {
                        binary: PuppeteerHandle.bundledPath,
                        extensions:
                            extensions.map(ex => readFileSync(ex.data.file, 'base64'))
                    },
                    prefs: {
                        "profile.default_content_settings.cookies": 0,
                        'download': {
                            'prompt_for_download': false,
                            'default_directory': dlmgr.downloadPath(),
                            'directory_upgrade': true
                        },
                        browser: {
                            set_download_behavior: {
                                behavior: 'allow'
                            }
                        }
                    }
                }
                break;
            }
            case 'firefox': {
                setup();
                let dlmgr = new LocalDownloadManager()
                currentEnv.config.capabilities = {
                    directConnect: true,
                    extraConfig: {
                        downloadManager: dlmgr.getConfig(),
                    },
                    browserName: 'firefox',
                    //TODO: Use get-firefox to download a local copy
                    //TODO: Implement metamask support
                }
                break;
            }
            case 'edge': {
                setup();
                let dlmgr = new LocalDownloadManager()
                currentEnv.config.capabilities = {
                    directConnect: true,
                    extraConfig: {
                        downloadManager: dlmgr.getConfig(),
                    },
                    browserName: 'edge',
                    //TODO: Implement metamask support
                }
                break;
            }
            case 'safari': {
                setup();
                let dlmgr = new LocalDownloadManager()
                currentEnv.config.capabilities = {
                    directConnect: true,
                    extraConfig: {
                        downloadManager: dlmgr.getConfig(),
                    },
                    browserName: 'safari',
                    //TODO: Implement metamask support
                }
                break;
            }
            case 'cloud': {
                assert(process.env.TEST_CBT_USER, `Crossbrowsertesting user is not defined`);
                assert(process.env.TEST_CBT_KEY, `Crossbrowsertesting key is not defined`);
                // In crossbrowsertesting, our 'localhost' is 'local'
                localhost = 'local';
                setup();
                let input = ['Windows 10:chrome:68.0'];
                let browser = process.env.TEST_BSBROWSER || currentEnv.argv.params.bsbrowser;
                if (browser) {
                    if (browser instanceof Array) {
                        input = browser;
                    }
                    else input = (browser as string).replace(/^'/, '').replace(/'$/, '').split(';');
                }
                let browsers = input.map(b => {
                    let components = b.split(':');
                    return {
                        platform: components[0],
                        browser: components[1],
                        version: components[2]
                    };
                });
                let dlmgr = new CloudDownloadManager();
                let oldBefore = currentEnv.config.beforeLaunch;
                let oldAfter = currentEnv.config.afterLaunch;
                currentEnv.config = {
                    ...currentEnv.config,
                    // Add again the environments as localhost changed
                    ...environments()[currentEnv.argv.env || 'local'],
                    localhost: localhost,
                    beforeLaunch: function () {
                        oldBefore();
                        deasync(callback => cbt.start({
                            "username": process.env.TEST_CBT_USER,
                            "authkey": process.env.TEST_CBT_KEY
                        }, callback))();
                    },
                    afterLaunch: async function (exitCode: number) {
                        // We can't change the log dir in CBT yet
                        moveSync(join(__dirname, '..', 'tunnel.log'), join(reportsDir, 'tunnel.log'), { overwrite: true });
                        await cbt.stop();
                        await oldAfter(exitCode);
                    },
                    seleniumAddress: `http://${process.env.TEST_CBT_USER}:${process.env.TEST_CBT_KEY}@hub.crossbrowsertesting.com/wd/hub`,
                    extraConfig: {
                        downloadManager: dlmgr.getConfig()
                    },
                }
                // TODO: Fix this for other browsers
                let extensions = getExtensions(extensionsString, ExtensionBrowser.Chrome);
                let ext = {};
                for (let ex of extensions) ext[ex.config.key] = ex.config.config;
                if (!browsers.length) throw `No CBT browsers detected, can't continue`;
                if (browsers.length === 1) {
                    currentEnv.config.capabilities = {
                        browserName: browsers[0].browser,
                        platform: browsers[0].platform,
                        version: browsers[0].version,
                        record_video: true,
                        chromeOptions: {
                            extensions: extensions.map(ex => readFileSync(ex.data.file, 'base64')),
                        },
                        keepAlive: 30
                    }
                }
                else {
                    currentEnv.config.multiCapabilities =
                        browsers.map(b => {
                            return {
                                browserName: b.browser,
                                platform: b.platform,
                                version: b.version,
                                record_video: true,
                                chromeOptions: {
                                    extensions: extensions.map(ex => readFileSync(ex.data.file, 'base64')),
                                },
                                keepAlive: 30
                            }
                        });
                }
                currentEnv.config.extraConfig.extensions = ext;
                break;
            }
        }
        return currentEnv;
    } catch (error) {
        console.error(`An error ocurred in the configuration file, exiting.`);
        console.error(error);
        debugger;
    }
}

