import { AbstractFeature } from "framework/object/abstract";
import { Import } from "../../pages/account/import";
import { Detail } from "../../pages/account/detail";
import { MetamaskPage } from "../../pages";


export abstract class AccountManager extends AbstractFeature {
    public abstract accounts: string[];
    public abstract create(lookForNext?: boolean): Promise<Detail | MetamaskPage>;
    public abstract import(lookForNext?: boolean): Promise<Import>;
    public abstract select(name: string, lookForNext?: boolean): Promise<Detail>;
}