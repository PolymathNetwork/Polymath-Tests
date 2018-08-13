import { Create } from ".";
import { Locator, By } from "framework/helpers";
import { injectable } from "framework/object/core/iConstructor";
import { MetamaskPage } from "../..";


@injectable export class NewCreate extends Create {
    protected featureSelector: Locator = By.xpath('self::*[@class="NOTIMPLEMENTED"]');
    public password: string;
    public async next(lookForNext: boolean = true): Promise<MetamaskPage> {
        return null;
    }
}