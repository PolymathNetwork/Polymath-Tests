import { MetamaskPage } from "../..";


export abstract class Create extends MetamaskPage {
    public abstract password: string;
    public abstract next(lookForNext?: boolean): Promise<MetamaskPage>;
}