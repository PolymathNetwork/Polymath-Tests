import { Locator, By } from "framework/helpers";
import { injectable } from "framework/object/core/iConstructor";
import { PageWithHeader } from "objects/pages/base";
import { AccountFeature } from "objects/features/account/account";

@injectable export class AccountPage extends PageWithHeader {
    protected featureSelector: Locator = By.xpath('.//body[.//*[@id="sign-up"]]');
    public account: AccountFeature = new AccountFeature(this);
}