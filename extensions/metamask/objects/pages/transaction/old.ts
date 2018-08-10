import { Transaction } from ".";
import { Locator, By, oh } from "framework/helpers";
import { injectable } from "framework/object/core/iConstructor";
import { MetamaskPage } from "..";
import { inputField } from "framework/object/core/decorators";


@injectable export class OldTransaction extends Transaction {
    protected featureSelector: Locator = By.xpath('self::*[.//*[@class="page-subtitle"]]');
    @inputField<number>(By.xpath('.//input[@type="number" and @class="hex-input"][1]')) public gas: number;
    @inputField<number>(By.xpath('.//input[@type="number" and @class="hex-input"][0]')) public gasLimit: number;
    public async next(lookForNext: boolean = true): Promise<MetamaskPage> {
        return oh.click(By.xpath('.//*[self::input[@type="submit" and contains(@class,"confirm") and not(@disabled)] or self::button[text()="Sign"]]'), this.element)
            .then(() => lookForNext && MetamaskPage.WaitForPage<MetamaskPage>(MetamaskPage));
    }
    public cancel(lookForNext: boolean = true): Promise<MetamaskPage> {
        throw new Error("Method not implemented.");
    }
}