import { IDataModelObject } from "framework/object/core";
import { oh, assert, tmpFile } from "framework/helpers";
import { EthAddress } from "models/ethGenerator";
import * as csv from 'csvtojson';
import * as fs from 'fs';
import * as moment from 'moment';

export abstract class SharedComplianceItem extends IDataModelObject {
    public ethAddress: string;
    public sellLockup: string;
    public buyLockup: string;
    public kyc: string;
    constructor(baseObject?: Object, nullable?: boolean) {
        super({}, nullable);
        baseObject = baseObject || {};
        // TODO: Make this prettier and with a decorator
        this.ethAddress = baseObject['Address'] || EthAddress.Generate().address;
        this.sellLockup = baseObject['Sale Lockup'] || oh.chance.date({ american: true });
        this.buyLockup = baseObject['Purchase Lockup'] || oh.chance.date({ american: true });
        this.kyc = baseObject['KYC/AML Expiry'] || oh.chance.date({ american: true });
    }
    public toCSV(): string {
        return `${this.ethAddress},${this.sellLockup || ''},${this.buyLockup || ''},${this.kyc || ''}`;
    }
    public static async fromCsv(this: { new(...args): SharedComplianceItem }, text: string | Object): Promise<SharedComplianceItem> {
        if (text instanceof Object) return new this(text);
        let result = await csv().fromString(text);
        assert(result.length === 1, `ComplianceItem - Couldn't parse CSV ${text}`);
        return new this(result[0]);
    }
}

export class ComplianceItem extends SharedComplianceItem {
    public canBuyFromSto: boolean;
    public exemptFromOwnership: boolean;
    public isAccredited: boolean;
    public nonAccreditedLimit: number;
    constructor(baseObject?: Object, nullable?: boolean) {
        super(baseObject, nullable);
        baseObject = baseObject || {};
        this.canBuyFromSto = baseObject['Can Buy From STO'] || oh.chance.boolOrNone();
        this.exemptFromOwnership = baseObject['Exempt From % Ownership'] || oh.chance.boolOrNone();
        this.isAccredited = baseObject['Is Accredited'] || oh.chance.boolOrNone();
        this.nonAccreditedLimit = baseObject['Non-Accredited Limit'] || oh.chance.natural({ max: 25000 });
    }
    public static async fromCsv(text: string | Object): Promise<ComplianceItem> {
        return SharedComplianceItem.fromCsv.call(ComplianceItem, text);
    }
    public toCSV(opts?: ComplianceOpts): string {
        return `${super.toCSV()},${this.canBuyFromSto}` +
            `${!opts.noExemptFromOwnership && (',' + this.exemptFromOwnership)}` +
            `${!opts.noIsAccredited && (',' + this.isAccredited)}` +
            `${!opts.noNonAccreditedLimit && (',' + this.nonAccreditedLimit)}`;
    }
    public static fromAddress(address: string): ComplianceItem {
        let item = new ComplianceItem();
        item.sellLockup = item.buyLockup = null;
        item.kyc = oh.chance.date({ year: oh.chance.natural({ min: moment().year() + 1, max: 5000 }), american: true });
        item.ethAddress = address;
        return item;
    }
}

export interface ComplianceOpts {
    noHeader?: boolean;
    noExemptFromOwnership?: boolean;
    noIsAccredited?: boolean;
    noNonAccreditedLimit?: boolean;
}

export class ComplianceData extends IDataModelObject {
    public addresses: ComplianceItem[];
    public static async fromCsv(text: string): Promise<ComplianceData> {
        let res = await csv().fromString(text);
        return new ComplianceData({ addresses: await Promise.all(res.map(r => ComplianceItem.fromCsv(r))) });
    }
    public static fromAddresses(text: string[]): ComplianceData {
        return new ComplianceData({ addresses: text.map(ComplianceItem.fromAddress) });
    }
    constructor(baseObject?: Object, nullable?: boolean) {
        super(baseObject, nullable);
        if (!baseObject) {
            this.addresses = oh.chance.n(() => new ComplianceItem(), oh.chance.natural({ min: 1, max: 10 }));
        }
    }
    public toCSV(opts?: ComplianceOpts): string {
        if (!opts) opts = {};
        let csv = this.addresses.map(item => item.toCSV(opts));
        let header = 'Address,Sale Lockup,Purchase Lockup,KYC/AML Expiry,Can Buy From STO';
        if (!opts.noExemptFromOwnership) header += ',Exempt From % Ownership';
        if (!opts.noIsAccredited) header += ',Is Accredited';
        if (!opts.noNonAccreditedLimit) header += ',Non-Accredited Limit';
        if (!opts.noHeader) csv = [header].concat(csv);
        return csv.join('\n');
    }
    public toFile(opts?: ComplianceOpts): string {
        let file = tmpFile({ prefix: 'compliance-', postfix: '.csv' });
        fs.writeFileSync(file, this.toCSV(opts));
        return file;
    }
}

export class WhitelistModel extends IDataModelObject {
    public enableOwnershipPermissions: boolean = true;//oh.chance.bool();
    public maxOwnership?: number = oh.chance.natural({ min: 1, max: 100 });
    public data: ComplianceData = new ComplianceData();
}