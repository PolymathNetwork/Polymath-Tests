import { Locator, By, oh } from "framework/helpers";
import { injectable } from "framework/object/core/iConstructor";
import { TermsAndConditions } from ".";
import { Locked } from "../locked";


@injectable export class OldTerms extends TermsAndConditions {
    protected featureSelector: Locator = By.xpath('self::*[.//div[@class="markdown"]]');
    public async next(lookForNext: boolean = true): Promise<TermsAndConditions | Locked> {
        await this.scrollToEnd();
        await oh.wait(async () => !await oh.present(By.xpath('.//button[@disabled]'), this.element),
            'Timeout waiting for the button to be enabled');
        return oh.click(By.xpath('.//button'), this.element)
            .then(() => lookForNext && TermsAndConditions.WaitForPage<TermsAndConditions>([TermsAndConditions, Locked]))
    }
}