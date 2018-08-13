import { MetamaskPage } from "..";


export abstract class Transaction extends MetamaskPage {
    public abstract gas: number;
    public abstract gasLimit: number;
    public abstract next(lookForNext?: boolean): Promise<MetamaskPage>;
    public abstract cancel(lookForNext?: boolean): Promise<MetamaskPage>;
}