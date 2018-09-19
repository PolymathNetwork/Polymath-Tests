import { Locator, By } from "framework/helpers";
import { injectable } from "framework/object/core/iConstructor";
import { IssuerPage } from "objects/pages/base";

// TODO: Fix these locators
@injectable export class NotFound extends IssuerPage {
    protected featureSelector: Locator = By.xpath('.//body[.//*[@id="not-found"]]');
}