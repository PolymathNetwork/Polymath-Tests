import { By, Locator, oh } from "framework/helpers";
import { ClickMode, comboBox, customValuelessCombobox, inputField, label, NumberParseMethod, order } from "framework/object/core/decorators";
import { injectable } from "framework/object/core/iConstructor";
import { RaiseIn } from "models/cappedStoConfig";
import { Modal } from "objects/features/general/modal";
import { CappedStoConfig } from "./capped.config";


@injectable export class OldCappedStoConfig extends CappedStoConfig {
    protected featureSelector: Locator = By.xpath('.//*[@class="bx--form"][.//*[@name="startTime"]]');
    @order(2) @inputField<string>(By.xpath('.//input[@id="startDate"]'), null,
        { clickMode: ClickMode.ClickAfterSet, sendEnter: true }) public startDate: string;
    @order(1) @inputField<string>(By.xpath('.//input[@id="endDate"]'), null,
        { clickMode: ClickMode.ClickAfterSet, sendEnter: true }) public endDate: string;
    @customValuelessCombobox(By.xpath('.//*[@name="startTime"]/option')) public startTime: string;
    @customValuelessCombobox(By.xpath('.//*[@name="endTime"]/option')) public endTime: string;
    @comboBox(By.xpath('.//*[@name="currency"]'), {
        'POLY': RaiseIn.POLY,
        'ETH': RaiseIn.ETH
    }, { ignoreNotVisible: true, noEmptyOptionPresent: true }) public raiseIn: RaiseIn;
    @inputField<number>(By.xpath('.//*[@id="cap"]')) public hardCap: number;
    @inputField<number>(By.xpath('.//*[@id="rate"]')) public rate: number;
    @inputField<string>(By.xpath('.//*[@id="fundsReceiver"]'), null, { numberParseMethod: NumberParseMethod.None }) public ethAddress: string;
    @label<number>(By.xpath('.//fieldset'), /(\d+)/) public fundsRaised: number;

    public next(): Promise<Modal> {
        return oh.click(By.xpath('.//button[@type="submit"]'), this.element).then(() => Modal.WaitForPage<Modal>(Modal));
    }
}