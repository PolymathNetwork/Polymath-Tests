import { Locked } from ".";
import { Locator, By, oh } from "framework/helpers";
import { injectable } from "framework/object/core/iConstructor";
import { inputField } from "framework/object/core/decorators";
import { Import } from "../account/import";
import { MetamaskPage } from "..";


@injectable export class OldLocked extends Locked {
    protected featureSelector: Locator = By.xpath('self::*[.//*[@id="password-box"]][.//p[@class="pointer"]]');
    @inputField<string>(By.xpath('.//*[@id="password-box"]')) public password: string;
    public async next(lookForNext: boolean = true): Promise<MetamaskPage> {
        return oh.click(By.xpath('.//button'), this.element).then(() => lookForNext && MetamaskPage.Get<MetamaskPage>(MetamaskPage));
    }
    public async import(lookForNext: boolean = true): Promise<Import> {
        return oh.click(By.xpath('.//p[@class="pointer"]'), this.element).then(() => lookForNext && Import.WaitForPage<Import>(Import));
    }
}