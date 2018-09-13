import { Detail } from ".";
import { Locator, By } from "framework/helpers";
import { injectable } from "framework/object/core/iConstructor";
import { label, NumberParseMethod, LabelOptsMode } from "framework/object/core/decorators";


@injectable export class OldDetail extends Detail {
    protected featureSelector: Locator = By.xpath('self::*[.//*[contains(@class,"account-detail-section")]]');
    @label<string>(By.xpath('.//*[@name="edit"]')) public name: string;
    @label<number>(By.xpath('.//*[@class="flex-row"][./*[text()="ETH"]]/div[1]'),
        null, {
            numberParseMethod: NumberParseMethod.ParseFloat,
        }) public ethAmount: number;
    @label<string>(By.xpath('.//div[@class="flex-row"][preceding-sibling::*[@class="name-label"]]/div'),
        null, { numberParseMethod: NumberParseMethod.None }) public ethAddress: string;
}