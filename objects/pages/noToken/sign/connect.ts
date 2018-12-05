import { Locator, By } from "framework/helpers";
import { injectable } from "framework/object/core/iConstructor";
import { Metamask } from "extensions/metamask";
import { SignPage } from "./sign";
import { AuthPage } from "./abstract";

@injectable export class ConnectPage extends AuthPage {
    protected featureSelector: Locator = By.xpath('//body[.//*[@id="metamask-access-requested"]]');
    public async next(lookForNext: boolean = true): Promise<AuthPage> {
        await Metamask.instance.confirmTransaction();
        return lookForNext && AuthPage.WaitForPage(AuthPage) as Promise<AuthPage>;
    }
}