import { After, HookScenarioResult, World, Status, setDefaultTimeout, Before, AfterAll } from 'cucumber';
import { oh, WindowInfo, By, TestConfig } from 'framework/helpers';
import { Metamask, Network } from 'extensions/metamask';
import { stringify } from 'circular-json';
import { Mongo } from 'helpers/mongo';
import { createReporter } from 'istanbul-api';
import * as istanbulCoverage from 'istanbul-lib-coverage';
import { join } from 'path';
import { writeFileSync, mkdirpSync, removeSync, existsSync } from 'fs-extra';
import { sync } from 'glob';
import { Setup, Process } from 'setup';
const debugMode = process.env.IS_DEBUG;

process.on('uncaughtException', function (err) {
    console.error((err && err.stack) ? err.stack : err);
    debugger;
    if (err) process.exit(1);
    // TODO : Find out how to mark the current test case as failed instead
});

// For process.exit file removal, when having a lot of files
require('events').EventEmitter.defaultMaxListeners = 100;

setDefaultTimeout(debugMode ? 60 * 60 * 1000 : 8 * 60 * 1000);

// TODO: Build nice reporting
Before({ timeout: 1 * 60 * 1000 }, async function () {
    try {
        await Mongo.resetDb();
    } catch (error) {
        console.log(`An error ocurred while resetting the db: ${error}`);
    }
});
AfterAll({ timeout: 1 * 60 * 1000 }, async function () {
    try {
        await Mongo.disconnect();
    } catch (error) {
        console.log(`An error ocurred while disconnecting from the db: ${error}`);
    }
});


let first = true;
Before({ timeout: debugMode ? 60 * 60 * 1000 : 5 * 60 * 1000 }, async function (this: World, scenario: HookScenarioResult) {
    if (first) first = false;
    else await oh.restart();
    await oh.browser.maximize();
});

Before({ timeout: debugMode ? 60 * 60 * 1000 : 5 * 60 * 1000 }, async function (this: World, scenario: HookScenarioResult) {
    // Restart ganache if running
    let config = `${scenario.sourceLocation.uri}.json`
    if (Setup.instance.isRunning(Process.Ganache) && existsSync(config)) {
        await Setup.instance.kill(Process.Ganache);
        await Setup.instance.ganache({
            folder: Setup.instance.ganacheFolder,
            config: config
        });
        // Skip steps that are marked as done in the ganache config
        console.log('Skipping steps done by the ganache configuration...');
        scenario.pickle.steps = scenario.pickle.steps.filter(step => step.text.indexOf('@optional') === null);
        // Define a global variable stating that the test is being run with the ganache configuration
        global['GanacheConfig'] = true;
    } else {
        console.log('Ganache configuration not found, running all the steps');
        global['GanacheConfig'] = false;
    }
});


let find = function (en: Object, name: string): string {
    for (let key of Object.keys(en)) if (isNaN(key as any) && key.toLowerCase().startsWith(name)) return key;
    return null;
}

Before({ timeout: debugMode ? 60 * 60 * 1000 : 5 * 60 * 1000 }, async function (this: World, scenario: HookScenarioResult) {
    let secret = process.env.TEST_MM_SECRET;
    if (!secret) throw `Missing metamask secret! You need to add the environment variable 'TEST_MM_SECRET' for the tests to work`;
    console.log('DEBUG: Importing metamask account');
    await Metamask.instance.importAccount(secret);
    console.log('DEBUG: Switching network');
    await Metamask.instance.switchNetwork(Network[find(Network, process.env.TEST_MM_NETWORK)] || Network.Kovan);
    console.log('DEBUG: Switching account');
    if (process.env.TEST_MM_ACCOUNT_NUMBER)
        for (let i = 1; i < parseInt(process.env.TEST_MM_ACCOUNT_NUMBER); ++i)
            await Metamask.instance.switchAccount();
    let info = await Metamask.instance.accountInfo();
    console.log(`INFO: Using '${info.name}' (${info.ethAddress}) with ${info.ethAmount} ETH`);
});

Before({ timeout: debugMode ? 60 * 60 * 1000 : 5 * 60 * 1000 }, async function (this: World, scenario: HookScenarioResult) {
    console.log('DEBUG: Closing extra windows');
    let def = await oh.browser.defaultFrame(true);
    let all = await oh.browser.getAllWindowHandles();
    let handles = all.filter(h => def.windowHandle != h);
    if (all.length == handles.length) handles = handles.splice(0, 1);
    for (let h of handles) {
        try {
            await oh.browser.switchToFrame(new WindowInfo(h, [null]));
            await oh.browser.window().close();
        } catch (error) {
            debugger;
        }
    }
});

// Error reporting
After(async function (this: World, scenario: HookScenarioResult) {
    let world = this;
    const report = async function () {
        switch (process.env.TEST_FAIL_LOG) {
            default:
            case 'image':
                let base64 = await oh.browser.takeScreenshot();
                await world.attach(base64, 'image/png');
                break;
            case 'html':
                console.log(await oh.html(By.xpath('//body')));
                break;
        }
    }
    if (scenario.result.status === Status.FAILED) {
        // Take screenshot and attach it to the test
        try {
            console.log('DEBUG: Logging main page...');
            await report();
            let def = await oh.browser.currentFrame();
            let all = await oh.browser.getAllWindowHandles();
            let handles = all.filter(h => def.windowHandle != h);
            if (all.length == handles.length) handles = handles.splice(0, 1);
            for (let i = 0; i < handles.length; ++i) {
                console.log(`DEBUG: Logging page ${i + 1} of ${handles.length}...`);
                try {
                    await oh.browser.switchToFrame(new WindowInfo(handles[i], [null]));
                    await report();
                } catch (error) {
                    console.log(`Cucumber After - Attaching error: Can't take secondary screenshot.\n ${stringify(error)}`)
                }
            }
        }
        catch (error) {
            console.error(`Cucumber After - Attaching error: Can't take primary screenshot.\n ${stringify(error)}`);
        }
    }
    // If we restart here we risk a node instakill
});

let coverageDir = join(TestConfig.reportPath, 'coverage');
let istanbulDir = join(coverageDir, 'istanbul');
removeSync(coverageDir);
mkdirpSync(coverageDir);
// Code coverage
After(async function (this: World, scenario: HookScenarioResult) {
    let cov = await oh.browser.executeScript('return window.__coverage__;');
    if (cov) {
        console.log(`Adding coverage results for ${scenario.sourceLocation}`);
        writeFileSync(join(coverageDir, `${scenario.pickle.name.replace(' ', '_').toLowerCase()}.json`), stringify(cov));
    }
});

TestConfig.registerShutdownProcedure(async function () {
    // Inspired on https://github.com/facebook/jest/blob/master/scripts/mapCoverage.js
    console.log('Creating coverage...')
    const map = istanbulCoverage.createCoverageMap();
    const reporter = createReporter();
    reporter.dir = istanbulDir;
    sync('*.json', { cwd: coverageDir, absolute: true }).forEach(m => map.addFileCoverage(m));
    reporter.addAll(['cobertura', 'html']);
    reporter.write(map);
});

