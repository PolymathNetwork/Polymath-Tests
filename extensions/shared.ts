export enum ExtensionBrowser {
    None = 0, Chrome, Firefox, Edge, Safari, Brave, Opera
}

export function GetFileExtensionForBrowser(browser: ExtensionBrowser) {
    switch (browser) {
        case ExtensionBrowser.Brave:
        case ExtensionBrowser.Opera:
        case ExtensionBrowser.Chrome:
            return 'crx';
        case ExtensionBrowser.Firefox:
            return 'xpi';
        case ExtensionBrowser.Safari:
            return 'xyz';
        case ExtensionBrowser.Edge:
            return 'appx';
    }
}

export interface ExtensionData {
    file: string;
    uncompressed: string;
    afterExecution: (() => Promise<void> | void);
}

export interface ExtensionConfig {
    key: string;
    config: Object;
}