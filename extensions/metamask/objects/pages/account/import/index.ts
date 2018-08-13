import { Detail } from "../detail";
import { MetamaskPage } from "../..";
import { TermsAndConditions } from "../../terms";


export abstract class Import extends MetamaskPage {
    public abstract password: string;
    public abstract seed: string;
    public abstract next(lookForNext?: boolean): Promise<Detail | TermsAndConditions>;
}