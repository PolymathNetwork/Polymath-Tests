import { Import } from ".";
import { Locator, By, oh } from "framework/helpers";
import { injectable } from "framework/object/core/iConstructor";
import { Detail } from "../detail";
import { inputField, fillWith } from "framework/object/core/decorators";
import { TermsAndConditions } from "../../terms";


@injectable export class NewImport extends Import {
    protected featureSelector: Locator = By.xpath('self::*[.//*[@class="import-account"] or .//*[self::button and text()="Import"]]');
    @inputField<string>(By.xpath('.//*[@id="password"]')) public password: string;
    @fillWith('password') @inputField<string>(By.xpath('.//*[@id="confirm-password"]')) public passwordConfirm: string;
    @inputField<string>(By.xpath('.//textarea')) public seed: string;
    public async next(lookForNext: boolean = true, skipTou: boolean = true): Promise<Detail | TermsAndConditions> {
        await oh.click(By.xpath('.//button'), this.element);
        if (lookForNext) {
            let page = await Detail.WaitForPage<Detail>([Detail, TermsAndConditions]);
            if (skipTou && page instanceof TermsAndConditions) {
                console.log('INFO - Import: Auto-skipping Terms and Conditions');
                await page.skipTou();
            }
            return page;
        }
    }
}