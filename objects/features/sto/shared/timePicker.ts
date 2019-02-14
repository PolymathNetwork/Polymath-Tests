import { By, Locator, oh } from "framework/helpers";
import { customDecorator } from "framework/object/core/decorators";


export function timePicker(locator: Locator) {
    return customDecorator<string>(async function () {
        let element = await oh.by(locator, this.target.element);
        return oh.text(By.xpath('preceding-sibling::*'), element);
    }, async function (val: string) {
        let element = await oh.by(locator, this.target.element);
        let toClick = await oh.by(By.xpath('ancestor::*[./preceding-sibling::label]'), element);
        let toSelect = await oh.by(By.xpath(`.//*[@role="option"][text()="${val}"]`), null, false);
        await oh.click(toClick, null, { autoScroll: false });
        await oh.click(toSelect, null, { autoScroll: false });
    });
}