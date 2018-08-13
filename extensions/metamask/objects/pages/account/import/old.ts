import { Import } from ".";
import { Locator, By, oh } from "framework/helpers";
import { injectable } from "framework/object/core/iConstructor";
import { inputField, fillWith } from "framework/object/core/decorators";
import { Detail } from "../detail";


@injectable export class OldImport extends Import {
    protected featureSelector: Locator = By.xpath('self::*[.//*[@id="password-box"]][.//textarea]');
    @inputField<string>(By.xpath('.//*[@id="password-box"]')) public password: string;
    @fillWith('password') @inputField<string>(By.xpath('.//*[@id="password-box-confirm"]')) public passwordConfirm: string;
    @inputField<string>(By.xpath('.//textarea')) public seed: string;
    public async next(lookForNext: boolean = true): Promise<Detail> {
        return oh.click(By.xpath('.//button[text()="OK"]'), this.element)
            .then(() => lookForNext && Detail.Get<Detail>(Detail));
    }
}