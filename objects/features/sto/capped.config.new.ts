import { By, Locator, oh } from "framework/helpers";
import { customValuelessCombobox, inputField, label, NumberParseMethod, order, radioBox, customDecorator } from "framework/object/core/decorators";
import { injectable } from "framework/object/core/iConstructor";
import { CappedStoConfigModel, RaiseIn } from "models/cappedStoConfig";
import { Modal } from "objects/features/general/modal";
import { StoConfig } from "./abstract";
import { datePicker, timePicker } from "./shared";
import { currencyDropDown } from "./shared";


@injectable export class CappedStoConfig extends StoConfig implements CappedStoConfigModel {
    protected featureSelector: Locator = By.xpath('.//*[@class="pui-page-box"][.//*[@id="cap"]]');
    @order(2) @datePicker(By.xpath('.//*[@name="date.startDate"]')) public startDate: string;
    @order(1) @datePicker(By.xpath('.//*[@name="date.endDate"]')) public endDate: string;
    @timePicker(By.xpath('.//*[@id="date.startTime"]')) public startTime: string;
    @timePicker(By.xpath('.//*[@id="date.endTime"]')) public endTime: string;
    @currencyDropDown(By.xpath('.//div[not(@class) and not(@id)][.//*[@name="currency"]]')) public raiseIn: RaiseIn;
    @inputField<number>(By.xpath('.//*[@id="cap"]')) public hardCap: number;
    @inputField<number>(By.xpath('.//*[@id="rate"]')) public rate: number;
    @inputField<string>(By.xpath('.//*[@id="receiverAddress"]'), null, { numberParseMethod: NumberParseMethod.None }) public ethAddress: string;
    @label<number>(By.xpath('.//fieldset'), /(\d+)/) public fundsRaised: number;

    public next(): Promise<Modal> {
        return oh.click(By.xpath('.//button[@type="submit"]'), this.element).then(() => Modal.WaitForPage<Modal>(Modal));
    }
}