import { Transaction } from ".";
import { Locator, By } from "framework/helpers";
import { injectable } from "framework/object/core/iConstructor";
import { MetamaskPage } from "..";


@injectable export class NewTransaction extends Transaction {
    protected featureSelector: Locator = By.xpath('self::*[@class="NOTIMPLEMENTED"]');
    public gas: number;
    public gasLimit: number;
    public next(lookForNext: boolean = true): Promise<MetamaskPage> {
        throw new Error("Method not implemented.");
    }
    public cancel(lookForNext: boolean = true): Promise<MetamaskPage> {
        throw new Error("Method not implemented.");
    }
}