import { Settings } from ".";
import { Locator, By, oh } from "framework/helpers";
import { injectable } from "framework/object/core/iConstructor";
import { Locked } from "../../pages/locked";
// Beware with circular references
import { NewAccountManager } from "../account/new";


@injectable export class NewSettingsFakeMenu extends Settings {
    protected featureSelector: Locator = By.xpath('.//*[@class="account-menu__icon"]');
    private account: NewAccountManager = new NewAccountManager();
    public async lock(lookForNext: boolean = true): Promise<Locked> {
        await this.account.waitForMenu();
        return oh.click(By.xpath('.//*[@class="account-menu__logout-button"]')).then(() => lookForNext && Locked.WaitForPage<Locked>(Locked));
    }
    public async settings(lookForNext: boolean = true): Promise<void> {
        await this.account.select('Settings', false);
        let page = await new NewSettingsPage().load();
        return page.settings(lookForNext);
    }
    public async info(lookForNext: boolean = true): Promise<void> { }
    // Taken from account manager, now they're the same
}

@injectable export class NewSettingsPage extends Settings {
    protected featureSelector: Locator = By.xpath('.//*[@class="main-container settings"]');
    public async lock(lookForNext: boolean = true): Promise<Locked> {
        throw `ERROR - MetaMask: In the new ui, you log out from the menu - not from the settings page.`
    }
    public async settings(lookForNext: boolean = true): Promise<void> { }
    public async info(lookForNext: boolean = true): Promise<void> { }
}