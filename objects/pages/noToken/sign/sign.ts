import { Locator, By, oh } from "framework/helpers";
import { injectable } from "framework/object/core/iConstructor";
import { PageWithHeader } from "objects/pages/base";
import { Metamask } from "extensions/metamask";

@injectable export class SignPage extends PageWithHeader {
    protected featureSelector: Locator = By.xpath('//body[.//*[@id="sign-in"]]');
    public async next(lookForNext: boolean = true): Promise<PageWithHeader> {
        await Metamask.instance.confirmTransaction();
        return lookForNext && PageWithHeader.WaitForPage(PageWithHeader) as Promise<PageWithHeader>;
    }
}