import { By, Locator } from "framework/helpers";
import { inputField, present } from "framework/object/core/decorators";
import { injectable } from "framework/object/core/iConstructor";
import { WhitelistModal } from "./modal";

@injectable
export class OldWhitelistModal extends WhitelistModal {
    protected featureSelector: Locator = By.xpath('.//*[contains(@class, "whitelist-import-modal") and contains(@class, "is-visible")]');
    @present(By.xpath('.//button[@type="submit" and @disabled]')) public hasError: boolean;
    @inputField<string>(By.xpath('.//input[@type="file"]')) public file: string;
}