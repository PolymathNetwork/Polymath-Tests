import { Locked } from ".";
import { Locator, By } from "framework/helpers";
import { injectable } from "framework/object/core/iConstructor";
import { MetamaskPage } from "..";
import { Import } from "../account/import";


@injectable export class NewLocked extends Locked {
    protected featureSelector: Locator = By.xpath('.//body[@class="NOTIMPLEMENTED"]');
    public password: string;
    public next(lookForNext: boolean = true): Promise<MetamaskPage> {
        throw new Error("Method not implemented.");
    }
    public import(lookForNext: boolean = true): Promise<Import> {
        throw new Error("Method not implemented.");
    }
}