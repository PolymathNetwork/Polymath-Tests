import { NetworkManager } from ".";
import { Locator, By } from "framework/helpers";
import { injectable } from "framework/object/core/iConstructor";
import { Network } from "../../../shared";
import { MetamaskPage } from "../../pages";


@injectable export class NewNetworkManager extends NetworkManager {
    protected featureSelector: Locator = By.xpath('.//body[@class="NOTIMPLEMENTED"]');
    public async next(network: Network, lookForNext: boolean = true): Promise<MetamaskPage> {
        return null;
    }
}