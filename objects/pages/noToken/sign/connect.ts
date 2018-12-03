import { Locator, By } from "framework/helpers";
import { injectable } from "framework/object/core/iConstructor";
import { PageWithHeader } from "objects/pages/base";
import { Metamask } from "extensions/metamask";
import { SignPage } from "./sign";

@injectable export class ConnectPage extends PageWithHeader {
    protected featureSelector: Locator = By.xpath('//body[.//*[@id="sign-in"]]');
    public async next(lookForNext: boolean = true): Promise<SignPage> {
        await Metamask.instance.confirmTransaction();
        return lookForNext && SignPage.WaitForPage(SignPage) as Promise<SignPage>;
    }
}