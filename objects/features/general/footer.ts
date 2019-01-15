import { AbstractFeature, AbstractPage } from "framework/object/abstract";
import { Locator, By, oh } from "framework/helpers";

export class PrivacyPage extends AbstractPage {
    public featureSelector: Locator = By.xpath('.//h3[contains(text(), "Privacy")]');
}

export class TermsPage extends AbstractPage {
    public featureSelector: Locator = By.xpath('.//h3[contains(text(), "Terms")]');
}

export class FooterFeature extends AbstractFeature {
    public featureSelector: Locator = By.xpath('.//*[contains(@class, "pui-footer")][.//*[@class="pui-footer-text"]]');
    public async privacy(lookForNext: boolean = true): Promise<PrivacyPage> {
        await oh.browser.window().waitForNewWindow(() => oh.click(By.xpath('.//*[contains(@href, "privacy")]'), this.element));
        return lookForNext && new PrivacyPage().load();
    }
    public async terms(lookForNext: boolean = true): Promise<TermsPage> {
        await oh.browser.window().waitForNewWindow(() => oh.click(By.xpath('.//*[contains(@href, "terms")]'), this.element));
        return lookForNext && new TermsPage().load();
    }
}