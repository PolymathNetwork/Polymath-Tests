import { Locked } from ".";
import { Locator, By, oh, ElementWrapper } from "framework/helpers";
import { injectable } from "framework/object/core/iConstructor";
import { MetamaskPage } from "..";
import { Import } from "../account/import";
import { inputField, fillWith, order } from "framework/object/core/decorators";
import { AbstractObjectInitOpts } from "framework/object/abstract";


@injectable export class NewLocked extends Locked {
    protected featureSelector: Locator = By.xpath('self::*[.//*[@class="create-password" or contains(@class,"create-password__import-link")]]');
    @order(2) @inputField<string>(By.xpath('.//*[@id="create-password"]')) public password: string;
    @order(1) @fillWith('password') @inputField<string>(By.xpath('.//*[@id="confirm-password"]')) public passwordConfirm: string;
    public next(lookForNext: boolean = true): Promise<MetamaskPage> {
        return oh.click(By.xpath('.//button'))
            .then(() => lookForNext && MetamaskPage.WaitForPage<MetamaskPage>(MetamaskPage));
    }
    public import(lookForNext: boolean = true): Promise<Import> {
        return oh.click(By.xpath('.//*[contains(@class, "create-password__import-link")]'))
            .then(() => lookForNext && Import.WaitForPage<Import>(Import));
    }
    public async afterInit(result: this, opts: AbstractObjectInitOpts) {
        await MetamaskPage.RemoveCss();
    }
}