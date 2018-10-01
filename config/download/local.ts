import { DownloadManager, DownloadedFile, DownloadConfig } from "./abstract";
import { sync as glob } from 'glob';
import * as fs from 'fs';
import * as path from 'path';
import { tmpDir } from "framework/helpers";

export class LocalDownloadManager extends DownloadManager {
    public static UUID: string = 'LOCAL_DOWNLOAD_MANAGER';
    public restoreConfig(config: DownloadConfig): void {
        this._downloadPath = config.downloadPath;
    }
    public getConfig(): DownloadConfig {
        return { uuid: LocalDownloadManager.UUID, downloadPath: this._downloadPath };
    }
    protected _downloadPath: string;
    constructor(config?: DownloadConfig) {
        super(config);
        if (config) this.restoreConfig(config);
        else {
            this.generateDownloadPath();
        }
    }

    public generateDownloadPath(): string {
        this._downloadPath = tmpDir();
        return this._downloadPath;
    }
    public downloadPath(): string {
        return this._downloadPath;
    }

    public async getFiles(filter: string): Promise<DownloadedFile[]> {
        let files: DownloadedFile[] = [];
        for (let file of glob(filter, { cwd: this._downloadPath })) {
            files.push({ name: file, contents: fs.readFileSync(file, 'utf8').toString() });
        }
        return files;
    }

    public waitForDownload(name: string, maxWait?: number): Promise<DownloadedFile> {
        console.log(`Waiting for download with filter '${name}' on ${this.downloadPath()}`);
        let downloadPath = this.downloadPath();
        let secondsBy = 0;
        return new Promise<DownloadedFile>((r, e) => {
            const interval = setInterval(function () {
                if (secondsBy++ >= maxWait) {
                    clearInterval(interval);
                    e(`Wait for Download - Timeout waiting for ${name} to appear in ${downloadPath}`);
                }
                let found = glob(name, { cwd: downloadPath });
                if (found.length) {
                    clearInterval(interval);
                    found = found.map(name => {
                        name = path.join(downloadPath, name);
                        return {
                            name: name,
                            modifiedDate: fs.statSync(name).mtime.getTime()
                        }
                    }).sort(function (a, b) {
                        return a.modifiedDate - b.modifiedDate;
                    }).map(f => f.name);
                    let file = found[found.length - 1];
                    console.log(`Found ${found.length} files, last one is ${file}`);
                    r({ name: file, contents: fs.readFileSync(file, 'utf8') });
                }
            }, 1000);
        });;
    }
}

DownloadManager.Register(LocalDownloadManager, LocalDownloadManager.UUID);