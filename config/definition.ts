import { Config as ProtractorConfig } from "protractor";
import { Config as EmailSettings } from "imap";
import { DownloadConfig } from "./download/abstract";

export interface RunnerConfig extends ProtractorConfig {
    emailConfig?: EmailSettings;
    dbConfig?: { mongo?: string };
    extraConfig?: {
        [k: string]: Object;
        extensions?: { [k: string]: Object };
        downloadManager?: DownloadConfig;
    };
    params?: {
        [k: string]: any;
        reportDir?: string;
        generatorSeed?: number;
    }
    localhost?: string;
    apps?: {
        investor?: string;
    };
}