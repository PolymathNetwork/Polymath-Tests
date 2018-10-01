import { Locator, By, oh } from "framework/helpers";
import { injectable, inject } from "framework/object/core/iConstructor";
import { nav, PageWithToken } from "objects/pages/withToken/base";
import { optional } from "framework/object/abstract";
import { CreateTokenCountdown } from "objects/features/token/countdown";
import { ProviderHolder, ProviderNavigation } from "objects/features/providers/providerHolder";

@injectable @nav(By.xpath('.//li[./p[text()="Providers"]]')) export class Providers extends PageWithToken {
    protected featureSelector: Locator = By.xpath('self::*[.//li[@class="active"]]');
    @inject(ProviderNavigation, { multiInstance: true }) public providerNavigation: ProviderNavigation[];
    @inject(ProviderHolder) public providers: ProviderHolder;
    @optional public createToken: CreateTokenCountdown = new CreateTokenCountdown(this);
}