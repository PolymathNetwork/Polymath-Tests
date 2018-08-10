import { AbstractPage } from "framework/object/abstract";
import { NetworkManager } from "../features/network";
import { inject } from "framework/object/core/iConstructor";
import { Settings } from "../features/settings";
import { AccountManager } from "../features/account";
import { Locator, By } from "framework/helpers";

export abstract class MetamaskPage extends AbstractPage {
    protected featureSelector: Locator = By.xpath('.//body');
    @inject(NetworkManager) public network: NetworkManager;
    @inject(Settings) public settings: Settings;
    @inject(AccountManager) public account: AccountManager;
}