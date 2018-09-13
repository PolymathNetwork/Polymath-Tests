import { AbstractFeature } from "framework/object/abstract";
import { injectable } from "framework/object/core/iConstructor";
import { Locator, By } from "framework/helpers";
import { label, LabelOptsMode, NumberParseMethod } from "framework/object/core/decorators";

@injectable export class StoInfo extends AbstractFeature {
    public featureSelector: Locator = By.xpath('.//*[@class="pui-page-box"][.//*[@class="pui-sto-status-contract"]]');
    @label<string>(By.xpath('.//*[@class="pui-sto-status-contract"]/a'), null, { numberParseMethod: NumberParseMethod.None }) public contract: string;
    @label<string>(By.xpath('.//*[@class="pui-sto-status-numbers"]/div[not(@class="pui-key-value")]')) public percentage: number;
    @label<string>(By.xpath('.//*[@class="pui-sto-status-numbers"]/div[@class="pui-key-value"]'), /([\d,]+)/, { numberParseMethod: NumberParseMethod.ParseIntWithCommas }) public cap: number;
    @label<string>(By.xpath('.//*[@class="pui-sto-status-dates"]/div[./div[text()="Start Date"]]'), /.*\n(.*)/, { dateFormat: "MMMM DD, YYYY" }) public startDate: Date;
    @label<string>(By.xpath('.//*[@class="pui-sto-status-dates"]/div[./div[text()="End Date"]]'), /.*\n(.*)/, { dateFormat: "MMMM DD, YYYY" }) public endDate: Date;
    @label<string>(By.xpath('.//*[@class="pui-sto-status-dates"]//div[./span]'), /^\d+\s([^\s]+)/) public currency: string;
    @label<string>(By.xpath('.//*[@class="pui-sto-status-dates"]//span'), /\s([^\s]+)$/) public token: string;
    @label<string>(By.xpath('.//*[contains(@class, "pui-countdown-raised")]'), /(\d+)/) public totalRaised: number;
    @label<string>(By.xpath('.//*[contains(@class, "pui-countdown-raised")]/div[2]'), /(\d+)/) public totalRaisedCurrency: number;
    @label<string>(By.xpath('.//*[@class="pui-sto-status-dates"]//span'), /(\d+)/) public conversion: number;
}