import * as fs from 'fs';
import * as path from 'path';
import { sync as rmdir } from 'rimraf';
import ChromeExtension = require('crx');
import rsa = require('node-rsa');
import { MetamaskDownloader, MetmaskData } from ".";
import { ExtensionBrowser } from "../../shared";


class ChromeMetamask extends MetamaskDownloader {
    public async getExtension(): Promise<MetmaskData> {
        let contents = await this.getRelease(ExtensionBrowser.Chrome);
        let result: MetmaskData = {
            file: contents.compressed.name,
            uncompressed: contents.uncompressed.name,
            afterExecution: () => {
                contents.compressed.removeCallback();
                rmdir(contents.uncompressed.name);
            },
            extensionId: null
        };
        // Repack the extension
        let manifestFile = path.join(contents.uncompressed.name, 'manifest.json');
        let manifest = JSON.parse(fs.readFileSync(manifestFile).toString());
        var key = new rsa({ b: 2048 }),
            keyVal = key.exportKey('pkcs1-private-pem');
        let crx = new ChromeExtension({
            privateKey: keyVal,
        });
        crx = await crx.load(contents.uncompressed.name);
        crx.publicKey = await crx.generatePublicKey();
        manifest.key = crx.publicKey.toString('base64');
        result.extensionId = await crx.generateAppId();
        console.log(`Registering extension with uuid ${result.extensionId}`)
        fs.writeFileSync(manifestFile, JSON.stringify(manifest), { encoding: 'utf8' });
        crx = new ChromeExtension({
            privateKey: keyVal,
            publicKey: manifest.key,
            appId: result.extensionId
        });
        crx = await crx.load(contents.uncompressed.name);
        let crxBuffer = await crx.pack();
        fs.writeFileSync(contents.compressed.name, crxBuffer);
        return result;
    }
}

MetamaskDownloader.Register(ChromeMetamask, ExtensionBrowser.Chrome);