import { Transaction } from ".";
import { Locator, By, oh } from "framework/helpers";
import { injectable } from "framework/object/core/iConstructor";
import { MetamaskPage } from "..";


@injectable export class NewSign extends Transaction {
    protected featureSelector: Locator = By.xpath('self::*[.//*[@class="request-signature__container"]]');
    public gas: number;
    public gasLimit: number;
    public next(lookForNext: boolean = true): Promise<MetamaskPage> {
        return oh.click(By.xpath('.//*[contains(@class, "btn-primary")]'), this.element)
            .then(() => lookForNext && MetamaskPage.Get<MetamaskPage>(MetamaskPage));
    }
    public cancel(lookForNext: boolean = true): Promise<MetamaskPage> {
        return oh.click(By.xpath('.//*[contains(@class, "btn-default")]'), this.element)
            .then(() => lookForNext && MetamaskPage.Get<MetamaskPage>(MetamaskPage));
    }
}

@injectable export class NewTransaction extends Transaction {
    protected featureSelector: Locator = By.xpath('self::*[.//*[@class="confirm-page-container-content"]]');
    public gas: number;
    public gasLimit: number;
    public next(lookForNext: boolean = true): Promise<MetamaskPage> {
        return oh.click(By.xpath('.//*[contains(@class, "btn-confirm")]'), this.element)
            .then(() => lookForNext && MetamaskPage.Get<MetamaskPage>(MetamaskPage));
    }
    public cancel(lookForNext: boolean = true): Promise<MetamaskPage> {
        return oh.click(By.xpath('.//*[contains(@class, "btn-default")]'), this.element)
            .then(() => lookForNext && MetamaskPage.Get<MetamaskPage>(MetamaskPage));
    }
}