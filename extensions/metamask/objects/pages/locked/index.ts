import { MetamaskPage } from "..";
import { Import } from "../account/import";


export abstract class Locked extends MetamaskPage {
    public abstract password: string;
    public abstract next(lookForNext?: boolean): Promise<MetamaskPage>;
    public abstract import(lookForNext?: boolean): Promise<Import>;
}