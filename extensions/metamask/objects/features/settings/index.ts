import { AbstractFeature } from "framework/object/abstract";
import { Locked } from "../../pages/locked";


export abstract class Settings extends AbstractFeature {
    public abstract lock(lookForNext?: boolean): Promise<Locked>;
    public abstract settings(lookForNext?: boolean): Promise<void>;
    public abstract info(lookForNext?: boolean): Promise<void>;
}