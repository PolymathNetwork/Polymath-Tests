import { AbstractPage } from "framework/object/abstract";
import { NetworkManager } from "../features/network";
import { inject } from "framework/object/core/iConstructor";
import { Settings } from "../features/settings";
import { AccountManager } from "../features/account";
import { Locator, By, oh, ElementWrapper } from "framework/helpers";

export abstract class MetamaskPage extends AbstractPage {
    protected featureSelector: Locator = By.xpath('.//body');
    @inject(NetworkManager) public network: NetworkManager;
    @inject(Settings) public settings: Settings;
    @inject(AccountManager) public account: AccountManager;
    public static async RemoveCss() {
        // Remove styles from html and body
        await oh.browser.executeScript('arguments[0].style=""',
            (await oh.by(By.xpath('.//body')) as ElementWrapper).getWebElement());
        await oh.browser.executeScript('arguments[0].style=""',
            (await oh.by(By.xpath('.//html')) as ElementWrapper).getWebElement());
    }
}