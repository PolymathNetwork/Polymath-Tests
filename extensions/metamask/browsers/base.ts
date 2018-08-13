import { load } from 'cheerio';
import * as request from 'request-promise-native';
import { MetamaskOptions } from '../shared';
import { GetFileExtensionForBrowser, ExtensionData, ExtensionBrowser } from '../../shared';
import * as tmp from 'tmp';
import * as unzipper from 'unzipper';
import * as fs from 'fs';

export interface MetmaskData extends MetamaskOptions, ExtensionData { }

export abstract class MetamaskDownloader {
    public static extensions: { [k: string]: { new(...args): MetamaskDownloader } } = {};
    public static Register(extension: { new(...args): MetamaskDownloader }, type: ExtensionBrowser) {
        this.extensions[type] = extension;
    }
    public static Get(browser: ExtensionBrowser): Promise<MetmaskData> {
        let br = this.extensions[browser];
        if (!br) throw `Metamask is not registered for ${ExtensionBrowser[browser]}`;
        return new br().getExtension();
    }
    public abstract async getExtension(): Promise<MetmaskData>;

    protected async getRelease(browser: ExtensionBrowser, version: string = "4.9.2") {
        let url = version ? `https://github.com/MetaMask/metamask-extension/releases/tag/v${version}`
            : 'https://github.com/MetaMask/metamask-extension/releases/latest';
        let html = await request.get(url, { followAllRedirects: true });
        let search = load(html);
        let found = search(`a[href*="metamask-${ExtensionBrowser[browser].toLowerCase()}"]`);
        if (!found) return null;
        let downloaded = tmp.fileSync({
            prefix: `metamask-extension-${ExtensionBrowser[browser]}`,
            postfix: `.${GetFileExtensionForBrowser(browser)}`
        });
        await new Promise<void>((r, e) => request.get(`https://github.com${found.attr('href')}`, { followAllRedirects: true })
            .on('error', function (err) {
                console.log(err);
                downloaded.removeCallback();
                e(err);
            })
            .pipe(fs.createWriteStream(downloaded.name)
                .on('finish', () => r())
                .on('error', err => {
                    downloaded.removeCallback();
                    e(err)
                })));
        let folder = tmp.dirSync({ prefix: `metamask-extension-${ExtensionBrowser[browser]}` });
        await new Promise((r, e) => fs.createReadStream(downloaded.name)
            .pipe(unzipper.Extract({ path: folder.name }))
            .on('close', r)
            .on('error', err => {
                downloaded.removeCallback();
                folder.removeCallback();
                e(err);
            }));
        return { compressed: downloaded, uncompressed: folder };
    }
}