import { MetamaskDownloader, MetmaskData } from "./abstract";
import { ExtensionBrowser } from "../../shared";


export class BraveMetamask extends MetamaskDownloader {
    public async getExtension(): Promise<MetmaskData> {
        console.log('Metamask is installed by default in Brave');
        return { uncompressed: null, file: null, afterExecution: null, extensionId: null };
    }
}

MetamaskDownloader.Register(BraveMetamask, ExtensionBrowser.Brave);