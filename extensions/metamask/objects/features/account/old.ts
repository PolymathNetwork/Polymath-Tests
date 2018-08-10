import { AccountManager } from ".";
import { Locator, By, oh, ElementWrapper } from "framework/helpers";
import { injectable } from "framework/object/core/iConstructor";
import { label } from "framework/object/core/decorators";
import { Detail } from "../../pages/account/detail";
import { Import } from "../../pages/account/import";


@injectable export class OldAccountManager extends AccountManager {
    protected featureSelector: Locator = By.xpath('.//*[contains(@class,"accounts-selector")]');
    @label<string[]>(By.xpath('.//li[@class="dropdown-menu-item"]')) public accounts: string[];
    public async create(lookForNext: boolean = true): Promise<Detail> {
        await this.waitForMenu();
        let el = await oh.by(By.xpath('.//li[@class="dropdown-menu-item"][.//span[text()="Create Account"]]'));
        return this.click(el).then(() => lookForNext && Detail.WaitForPage<Detail>(Detail));
    }
    public async import(lookForNext: boolean = true): Promise<Import> { return null; }
    public async select(name: string, lookForNext: boolean = true): Promise<Detail> {
        await this.waitForMenu();
        let el = await oh.by(By.xpath(`.//li[@class="dropdown-menu-item"][.//span[text()="${name}"]]`));
        return this.click(el).then(() => lookForNext && Detail.WaitForPage<Detail>(Detail));
    }
    private async waitForMenu(): Promise<void> {
        await oh.click(this.element);
        await oh.wait(oh.visible(By.xpath('.//*[@class="menu-droppo"]')), `Timeout waiting for the dropdown menu to appear`);
    }
    private async click(element: ElementWrapper): Promise<void> {
        let dropdown: ElementWrapper =
            await oh.by(By.xpath('.//*[@class="menu-droppo-container"][.//*[@class="menu-droppo"]]'));
        await oh.browser.executeScript(`arguments[0].scroll(0, arguments[1].offsetTop)`,
            await dropdown.getWebElement(), await element.getWebElement());
        await oh.click(element);
    }
}