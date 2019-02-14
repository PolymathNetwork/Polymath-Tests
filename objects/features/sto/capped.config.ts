import { Locator } from "framework/helpers";
import { CappedStoConfigModel, RaiseIn } from "models/cappedStoConfig";
import { Modal } from "objects/features/general/modal";
import { StoConfig } from "./abstract";


export abstract class CappedStoConfig extends StoConfig implements CappedStoConfigModel {
    protected abstract featureSelector: Locator;
    public abstract startDate: string;
    public abstract endDate: string;
    public abstract startTime: string;
    public abstract endTime: string;
    public abstract raiseIn: RaiseIn;
    public abstract hardCap: number;
    public abstract rate: number;
    public abstract ethAddress: string;
    public abstract fundsRaised: number;
    public abstract next(): Promise<Modal>;
}