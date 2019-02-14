import { AbstractFeature } from "framework/object/abstract";
import { order, customDecorator, inputField } from "framework/object/core/decorators";
import { oh, Locator, By } from "framework/helpers";
import moment = require("moment");

class DatePicker extends AbstractFeature {
    public featureSelector: Locator = By.xpath('.//*[contains(@class,"bx--date-picker__calendar") and contains(@class,"open")]');
    @order(3) @customDecorator<string>(async function () {
        return await oh.text(By.xpath('.//*[@class="cur-month"]'),
            this.target.element);
    },
        async function (val: string) {
            let actual: string = await this._get();
            while (actual.toLowerCase() != val.toLowerCase()) {
                await oh.click(By.xpath('.//*[@class="flatpickr-next-month"]'), this.target.element);
                actual = await this._get();
            }
        })
    public month: string;
    @order(2) @inputField(By.xpath('.//*[contains(@class,"cur-year")]'))
    public year: number;
    @order(1) @customDecorator<number>(async function () {
        let el = await oh.by(By.xpath('.//*[contains(@class,"selected") and contains(@class,"bx--date-picker__day")]'), this.target.element, false);
        return await oh.present(el) ? await oh.number(el) : null;
    },
        async function (val: number) {
            await oh.click(By.xpath(`.//*[@class="flatpickr-day bx--date-picker__day" and text()="${val}"]`),
                this.target.element);
        })
    public day: number;
}

export function datePicker(locator: Locator) {
    return customDecorator<string>(async function () {
        return await oh.text(locator, this.target.element);
    }, async function (val: string) {
        await oh.click(locator, this.target.element);
        // Only one datepicker can be open at the same time
        let dp = await new DatePicker().load(true);
        let date = moment(val);
        dp.month = date.format('MMMM');
        dp.year = parseInt(date.format('YYYY').toString());
        dp.day = parseInt(date.format('DD').toString());
        await dp.apply();
    })
}