import { AccountManager } from ".";
import { Locator, By } from "framework/helpers";
import { injectable } from "framework/object/core/iConstructor";
import { Import } from "../../pages/account/import";
import { Detail } from "../../pages/account/detail";


@injectable export class NewAccountManager extends AccountManager {
    protected featureSelector: Locator = By.xpath('.//body[@class="NOTIMPLEMENTED"]');
    public accounts: string[];
    public create(lookForNext: boolean = true): Promise<Detail> { return null; }
    public import(lookForNext: boolean = true): Promise<Import> { return null; }
    public select(name: string, lookForNext: boolean = true): Promise<Detail> { return null; }
}