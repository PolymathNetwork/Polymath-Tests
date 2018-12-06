import { Locator, oh, By } from "framework/helpers";
import { injectable } from "framework/object/core/iConstructor";
import { IssuerPage } from "objects/pages/base";
import { AuthPage } from "../sign/abstract";

@injectable export class Welcome extends IssuerPage {
    protected featureSelector: Locator = By.xpath('.//body[.//*[@id="create-token-btn"]]');
    constructor() {
        super(oh.browser.baseUrl);
    }
    public async next(): Promise<AuthPage> {
        await oh.click(By.xpath('.//*[@id="create-token-btn"]'));
        return await AuthPage.WaitForPage<AuthPage>(AuthPage);
    }
}