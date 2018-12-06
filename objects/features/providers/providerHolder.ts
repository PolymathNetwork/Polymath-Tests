import { AbstractFeature } from "framework/object/abstract";
import { present, label, LabelOptsMode, singleCheckbox, inputField } from "framework/object/core/decorators";
import { Locator, By, oh } from "framework/helpers";
import { Modal } from "objects/features/general/modal";
import { inject, injectable } from "framework/object/core/iConstructor";
import { ProviderFeature } from "./providerFeature";
import { ApplyProviderModel } from "models/applyProviderModel";

@injectable export class ApplyProviderModal extends Modal implements ApplyProviderModel {
    protected featureSelector: Locator = By.xpath('.//*[contains(@class, "providers-apply-modal")]');
    @inputField<string>(By.xpath('.//*[@name="companyName"]')) public name: string;
    @inputField<string>(By.xpath('.//*[@name="companyDesc"]')) public description: string;
    @inputField<string>(By.xpath('.//*[@name="operatedIn"]')) public jurisdictionOperation: string;
    @inputField<string>(By.xpath('.//*[@name="incorporatedIn"]')) public jurisdictionIncorporation: string;
    @inputField<string>(By.xpath('.//*[@name="projectURL"]')) public corporatePresentation: string;
    @inputField<string>(By.xpath('.//*[@name="profilesURL"]')) public managementBoardProfiles: string;
    @inputField<string>(By.xpath('.//*[@name="structureURL"]')) public corporateStructure: string;
    @inputField<string>(By.xpath('.//*[@name="otherDetails"]')) public otherDetails: string;
    public confirm(): Promise<null> {
        return super.confirm(true) as Promise<null>;
    }
}

@injectable export class ProviderHolder extends AbstractFeature {
    public featureSelector: Locator = By.xpath('.//*[@class="tab-content" and not(@hidden)]');
    @present(By.xpath('.//*[contains(@class, "bx--btn--primary") and not(@disabled)]')) public canApply: boolean;
    @label<string>(By.xpath('.//*[@class="pui-h2"]')) public title: string;
    @label<string>(By.xpath('.//*[@class="pui-h4"]')) public description: string;
    @inject(ProviderFeature, { multiInstance: true }) public providers: ProviderFeature[];
    @singleCheckbox(By.xpath('.//*[@for="select-all-providers"]'), {
        checkedSelector: By.xpath('.//*[@id="select-all-providers"]')
    }) public selectAll: boolean;
    public applySelected(lookForNext: boolean = true) {
        return oh.click(By.xpath('.//*[contains(@class, "bx--btn--primary")]'), this.element).then(() => lookForNext && ApplyProviderModal.WaitForPage<ApplyProviderModal>(ApplyProviderModal));
    }
    public skip(lookForNext: boolean = true) {
        // You should refresh the current provider after calling this
        return oh.click(By.xpath('.//*[contains(@class, "bx--btn--secondary")]'), this.element).then(() => lookForNext && ProviderHolder.WaitForPage<ProviderHolder>(ProviderHolder));
    }
}

@injectable export class ProviderNavigation extends AbstractFeature {
    protected featureSelector: Locator = By.xpath('.//*[contains(@class, "bx--tabs__nav-item")]');
    @label<string>(By.xpath('.//div[not(@class)]')) public title: string;
    @label<string>(By.xpath('.//*[@class="bx--tag"]'), /(\d+)/) public applied: number;
    @present(By.xpath('.//*[@class="bx--tag tag-my-own"]')) public haveMyOwn: boolean;
    @present(By.xpath('self::*[contains(@class, "selected")]')) public actual: boolean;
    public next(lookForNext: boolean = true) {
        return oh.click(this.element).then(() => lookForNext && ProviderHolder.WaitForPage<ProviderHolder>(ProviderHolder));
    }
}