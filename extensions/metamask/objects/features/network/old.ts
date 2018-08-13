import { NetworkManager } from ".";
import { Locator, By, oh } from "framework/helpers";
import { injectable } from "framework/object/core/iConstructor";
import { Network } from "../../../shared";
import { MetamaskPage } from "../../pages";


@injectable export class OldNetworkManager extends NetworkManager {
    protected featureSelector: Locator = By.xpath('.//*[@class="network-indicator"]');
    public async next(network: Network, lookForNext: boolean = true): Promise<MetamaskPage> {
        await oh.click(this.element);
        let loc = By.xpath(`.//li[@class="dropdown-menu-item" and contains(text(),"${Network[network]}")]`);
        await oh.wait(oh.clickable(loc), `NetworkManager: Timeout waiting for network selection to be clickable`);
        await oh.click(loc);
        // Some networks are marked as 'Private' and this breaks our locator
        return oh.browser.sleep(1).then(() => lookForNext && MetamaskPage.WaitForPage<MetamaskPage>(MetamaskPage));
    }
}