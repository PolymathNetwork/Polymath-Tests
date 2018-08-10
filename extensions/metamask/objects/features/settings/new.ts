import { Settings } from ".";
import { Locator, By } from "framework/helpers";
import { injectable } from "framework/object/core/iConstructor";
import { Locked } from "../../pages/locked";


@injectable export class NewSettings extends Settings {
    protected featureSelector: Locator = By.xpath('.//body[@class="NOTIMPLEMENTED"]');
    public async lock(lookForNext: boolean = true): Promise<Locked> { return null; }
    public async settings(lookForNext: boolean = true): Promise<void> { }
    public async info(lookForNext: boolean = true): Promise<void> { }
}