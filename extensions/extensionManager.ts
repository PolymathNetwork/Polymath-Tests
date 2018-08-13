import { ExtensionBrowser, ExtensionData, ExtensionConfig } from "./shared";

export interface ExtensionInfo {
    extension: { new(...args): Extension };
    name: string;
    supportedBrowsers: ExtensionBrowser;
}

export class ExtensionManager {
    public static extensions: ExtensionInfo[] = [];
    public static Register(extension: ExtensionInfo) {
        this.extensions.push(extension);
    }
    public static GetExtensions(browser: ExtensionBrowser): ExtensionInfo[] {
        return this.extensions.filter(ex => ex.supportedBrowsers & browser);
    }
}


export abstract class Extension {
    public abstract async getExtension(browser: ExtensionBrowser): Promise<ExtensionData>;
    // This configuration will be sent via protractor config to the different browsers
    // It must be able to recreate whatever information is necessary to interact
    // with the extension
    public abstract getConfig(): ExtensionConfig;
}