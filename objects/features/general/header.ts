import { AbstractFeature, optional, AbstractPage } from "framework/object/abstract";
import { Locator, By, oh } from "framework/helpers";
import { label, NumberParseMethod } from "framework/object/core/decorators";

export class Header extends AbstractFeature {
    public featureSelector: Locator = By.xpath('.//ul[.//*[@alt="Active network"]]');
    @label<string>(By.xpath('.//li[.//*[@alt="Active network"]]')) public network: string;
    @label<number>(By.xpath('.//li[.//*[@alt="Your POLY balance"]]')) public poly: number;
    @label<string>(By.xpath('.//li[.//*[@alt="Account"]]'), null, { numberParseMethod: NumberParseMethod.None }) public ethAddress: string;
    @optional @label<string>(By.xpath('.//li[.//*[@alt="Token"]]')) public token: string;
    public logo(lookForNext: boolean = true): Promise<AbstractPage> {
        return oh.click(By.xpath('.//img[@alt="Polymath"]')).then(() => lookForNext && AbstractPage.WaitForPage<AbstractPage>(AbstractPage));
    }
}