import { Detail } from ".";
import { Locator, By } from "framework/helpers";
import { injectable } from "framework/object/core/iConstructor";
import { LabelOptsMode, label, NumberParseMethod } from "framework/object/core/decorators";


@injectable export class NewDetail extends Detail {
    protected featureSelector: Locator = By.xpath('self::*[.//*[contains(@class,"account-and-transaction-details")]]');
    @label<string>(By.xpath('.//*[@class="account-name"]'),
        null, { mode: LabelOptsMode.Text }) public name: string;
    @label<number>(By.xpath('.//*[@class="token-amount"]'),
        null, {
            numberParseMethod: NumberParseMethod.ParseFloat,
            mode: LabelOptsMode.Text
        }) public ethAmount: number;
    @label<string>(By.xpath('.//*[@class="wallet-view__address"]'),
        null, { mode: LabelOptsMode.Text }) public ethAddress: string;
}