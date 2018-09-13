import { AbstractFeature, optional } from "framework/object/abstract";
import { Locator, By } from "framework/helpers";
import { label, LabelOptsMode, NumberParseMethod } from "framework/object/core/decorators";

export class Header extends AbstractFeature {
    public featureSelector: Locator = By.xpath('.//ul[.//*[@alt="Active network"]]');
    @label<string>(By.xpath('.//li[.//*[@alt="Active network"]]')) public network: string;
    @label<number>(By.xpath('.//li[.//*[@alt="Your POLY balance"]]')) public poly: number;
    @label<string>(By.xpath('.//li[.//*[@alt="Account"]]'), null, { numberParseMethod: NumberParseMethod.None }) public ethAddress: string;
    @optional @label<string>(By.xpath('.//li[.//*[@alt="Token"]]')) public token: string;
}