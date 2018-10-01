import { Locator, By } from "framework/helpers";
import { injectable } from "framework/object/core/iConstructor";
import { nav, PageWithToken } from "objects/pages/withToken/base";
import { WhitelistFeature } from "objects/features/whitelist/whitelist";

@injectable @nav(By.xpath('//*[@id="compliance-nav-link"]')) export class Whitelist extends PageWithToken {
    protected featureSelector: Locator = By.xpath('self::*[.//li[@class="active"]]');
    public whitelist: WhitelistFeature = new WhitelistFeature(this);
}