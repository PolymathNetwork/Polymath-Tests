import { MetamaskPage } from "..";
import { Locked } from "../locked";


export abstract class TermsAndConditions extends MetamaskPage {
    public abstract next(lookForNext?: boolean): Promise<TermsAndConditions | Locked>;
}