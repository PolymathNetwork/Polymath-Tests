import { Create } from ".";
import { Locator, By, oh } from "framework/helpers";
import { injectable } from "framework/object/core/iConstructor";
import { inputField, fillWith } from "framework/object/core/decorators";
import { Detail } from "../detail";


@injectable export class OldCreate extends Create {
    protected featureSelector: Locator = By.xpath('self::*[.//*[@id="password-box"]][not(.//textarea)]');
    @inputField<string>(By.xpath('.//*[@id="password-box"]')) public password: string;
    @fillWith('password') @inputField<string>(By.xpath('.//*[@id="password-box-confirm"]')) public passwordConfirm: string;
    public async next(lookForNext: boolean = true): Promise<Detail> {
        await oh.click(By.xpath('.//button'), this.element);
        return oh.click(By.xpath('.//button[@class="primary"][text()="I\'ve copied it somewhere safe"]'), this.element)
            .then(() => lookForNext && Detail.WaitForPage<Detail>(Detail));
    }
}