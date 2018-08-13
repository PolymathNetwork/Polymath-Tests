import { AbstractFeature } from "framework/object/abstract";
import { Network } from "../../../shared";
import { MetamaskPage } from "../../pages";


export abstract class NetworkManager extends AbstractFeature {
    public abstract next(network: Network, lookForNext?: boolean): Promise<MetamaskPage>;
}