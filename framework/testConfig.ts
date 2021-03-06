import { oh, RunnerConfig } from './helpers';
import * as path from 'path';
import { Capabilities } from 'selenium-webdriver';

// TODO: Refactor this class altogether
export class TestConfig {
    private static readonly capabilityKey: string = 'customTestConfig';
    private constructor(public capabilities: Capabilities, public protractorConfig: RunnerConfig) { }

    public get remote(): boolean {
        // This should work as long as we use RemoteWebDriver (e.g. to a Selenium Server)
        return this.capabilities.get('webdriver.remote.sessionid');
    }

    public static get reportPath(): string {
        return this.instance.protractorConfig.params.reportPath;
    }

    public static get instance(): TestConfig {
        if (!oh) return null;
        // Instance is going to differ based on the browser
        let caps = oh.browser.getCapabilities();
        let cfgcaps: TestConfig = caps.get(this.capabilityKey);
        if (cfgcaps == null) {
            let config = oh.browser.getProcessedConfig();
            cfgcaps = new TestConfig(caps, config);
            caps.set(this.capabilityKey, cfgcaps);
        }
        return cfgcaps;
    }

    private static shutdownMethods: (() => Promise<{}> | {})[] = [];
    public static async registerShutdownProcedure(fn: () => Promise<{}> | {}): Promise<void> {
        this.shutdownMethods.push(fn);
    }

    public static async shutdown(): Promise<void> {
        // ! Possible deadlock here if the function crashes
        for (let method of this.shutdownMethods) {
            try { await method(); }
            catch (error) {
                console.error(`Error while running a shutdown procedure: ${error}`);
            }
        }
    }
}
