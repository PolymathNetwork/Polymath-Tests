import { Locator } from "framework/helpers";
import { Modal } from "../general/modal";

export abstract class WhitelistModal extends Modal {
    protected featureSelector: Locator;
    public abstract hasError: boolean;
    public abstract file: string;
}