import { Settings, SettingsPage } from ".";
import { Locator, By, oh } from "framework/helpers";
import { injectable } from "framework/object/core/iConstructor";
import { Locked } from "../../pages/locked";
// Beware with circular references
import { NewAccountManager } from "../account/new";
import { MetamaskPage } from "../../pages";
import { inputField, singleCheckbox, order } from "framework/object/core/decorators";
import { AbstractFeature } from "framework/object/abstract";


@injectable export class NewSettingsFakeMenu extends Settings {
    protected featureSelector: Locator = By.xpath('.//*[@class="account-menu__icon"]');
    public async lock(lookForNext: boolean = true): Promise<Locked> {
        await new NewAccountManager().waitForMenu();
        return oh.click(By.xpath('.//*[@class="account-menu__logout-button"]')).then(() => lookForNext && Locked.WaitForPage<Locked>(Locked));
    }
    public async settings(lookForNext: boolean = true): Promise<SettingsPage> {
        await new NewAccountManager().waitForMenu();
        await oh.click(By.xpath('.//*[contains(@class, "menu__item--clickable")]/div[text()="Settings"]'));
        return lookForNext && new NewSettingsPage().load();
    }
    public async info(lookForNext: boolean = true): Promise<void> { }
    // Taken from account manager, now they're the same
}

export class ConfirmationDialog extends AbstractFeature {
    public featureSelector: Locator = By.xpath('.//*[@class="modal"]');
    public async next() {
        await oh.click('.//*[contains(@class, "btn-default")]');
    }
    public async cancel() {
        await oh.click('.//*[contains(@class, "btn-secondary")]');
    }
}

@injectable export class NewSettingsPage extends SettingsPage {
    protected featureSelector: Locator = By.xpath('.//*[contains(@class, "main-container") and contains(@class, "settings")]');
    @order(1) @inputField(By.xpath('.//*[@class="settings__input" or @id="new-rpc"]')) public customRpc: string;
    @order(2) @singleCheckbox(By.xpath('.//*[preceding-sibling::*[./span[text()="Privacy Mode"]]]/div/div'), {
        checkedSelector: By.xpath('.//input[@value="true"]')
    }) public privacyMode: boolean;
    public async next(): Promise<MetamaskPage> {
        await oh.click(By.xpath('.//*[contains(@class, "rpc-save-button")]'));
        return MetamaskPage.Get<MetamaskPage>(MetamaskPage);
    }
    public async close(): Promise<MetamaskPage> {
        // Metamask screwed up the close button...
        await oh.click(By.xpath('.//*[contains(@class,"app-header__metafox-logo--horizontal")]'));
        return MetamaskPage.Get<MetamaskPage>(MetamaskPage);
    }
    public async reset(): Promise<this> {
        await oh.click(By.xpath('.//*[contains(@class,"settings-tab__button--orange") and text()="Reset Account"]'));
        let dialog = await new ConfirmationDialog().load();
        await dialog.next();
        return this;
    }
    public async clearPrivacy(): Promise<this> {
        await oh.click(By.xpath('.//*[contains(@class,"settings-tab__button--orange") and text()="Clear Privacy Data"]'));
        let dialog = await new ConfirmationDialog().load();
        await dialog.next();
        return this;
    }
}