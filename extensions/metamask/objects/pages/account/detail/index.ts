import { MetamaskPage } from "../..";


export abstract class Detail extends MetamaskPage {
    public abstract name: string;
    public abstract ethAmount: number;
    public abstract ethAddress: string;
}