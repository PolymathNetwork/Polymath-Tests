import { Locator, By } from "framework/helpers";
import { injectable, inject } from "framework/object/core/iConstructor";
import { ProviderFeature } from "objects/features/providers/providerFeature";
import { nav, PageWithToken } from "objects/pages/withToken/base";
import { CreateTokenCountdown } from "../../../features/token/countdown";
import { optional } from "framework/object/abstract";

@injectable @nav(By.xpath('//*[@id="provider-nav-link"]')) export class Providers extends PageWithToken {
    protected featureSelector: Locator = By.xpath('self::*[.//li[@class="active"]]');
    @inject(ProviderFeature, { multiInstance: true }) public providers: ProviderFeature[];
    @optional public createToken: CreateTokenCountdown = new CreateTokenCountdown(this);
}