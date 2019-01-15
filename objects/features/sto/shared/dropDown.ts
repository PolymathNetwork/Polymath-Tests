import { AbstractFeature } from "framework/object/abstract";
import { customDecorator, label, comboBox, order, radioBox } from "framework/object/core/decorators";
import { RaiseIn } from "models/cappedStoConfig";
import { Locator, By, oh } from "framework/helpers";
import { injectable, inject, InitOpts } from "framework/object/core/iConstructor";
import { IImplementable } from "framework/object/core";

@injectable class SelectedItem extends AbstractFeature {
    public featureSelector: Locator = By.xpath('.//div[./button[.//*[@aria-label="icon--close"]]]');
    @order(2) @label(By.xpath('.//span')) public name: string;
    @order(1) @customDecorator<RaiseIn>(async function () {
        if (!this.target.name) await this.target.refresh('name');
        let res = /\((.*)\)/.exec(this.target.name);
        if (res && res.length > 1) return RaiseIn[res[1].toUpperCase()];
        return null;
    }) public type: RaiseIn;
    public async remove(): Promise<void> {
        await oh.click(By.xpath('.//button'), this.element);
        await oh.browser.sleep(1); // Buffer for the animation to go away
    }
}

class DropDown extends AbstractFeature {
    constructor(parent: IImplementable<InitOpts>, public featureSelector: Locator) { super(parent); }
    @label<number>(By.xpath('.//div[./*[@name="currency"]]//div[./*[@aria-label="icon--close"]]')) public selectedNumber: number;
    @radioBox(By.xpath('self::*'), {
        './/*[@role="option"][.//span[contains(text(), "ETH")]]': RaiseIn.ETH,
        './/*[@role="option"][.//span[contains(text(), "POLY")]]': RaiseIn.POLY,
        './/*[@role="option"][.//span[contains(text(), "DAI")]]': RaiseIn.DAI
    }, {
            bestEffort: true,
            clickLocator: By.xpath('.//div[./*[@name="currency"]]'),
            checkedSelector: async function (element) {
                let text = await oh.text(element);
                return await oh.present(By.xpath(`.//div[./button[.//*[@aria-label="icon--close"]]][.//span[text()="${text}"]]`), this.target.element);
            }
        }) public options: RaiseIn;
    @inject(SelectedItem, { multiInstance: true }) public selectedItems: SelectedItem[];
}

export function currencyDropDown(locator: Locator) {
    return customDecorator<RaiseIn[] | RaiseIn>(async function () {
        let dropDown = await new DropDown(this.target, locator).load();
        await dropDown.init();
        let result = dropDown.selectedItems.map(s => s.type);
        if (!result.length) return null;
        return result.length === 1 ? result[0] : result;
    }, async function (_val: RaiseIn[] | RaiseIn) {
        let val: RaiseIn[] = (!(_val instanceof Array)) ? [_val] : _val;
        let dropDown = await new DropDown(this.target, locator).load();
        await dropDown.init();
        // Once selected, it disappears from the combobox, so we need to filter it
        for (let item of dropDown.selectedItems.filter(el => !val.find(s => s === el.type)))
            await item.remove();
        for (let item of val.filter(el => !dropDown.selectedItems.find(s => s.type === el))) {
            dropDown.options = item;
            await dropDown.apply();
        }
    })
}