import { injectable } from "framework/object/core/iConstructor";
import { Locator, By, oh } from "framework/helpers";
import { AbstractFeature } from "framework/object/abstract";
import { Modal } from "objects/features/general/modal";
import { SimplePhoto } from "framework/object/abstractPhoto";
import { present, photo, label, singleCheckbox } from "framework/object/core/decorators";

@injectable export class ProviderModal extends Modal {
    protected featureSelector: Locator = By.xpath('.//*[contains(@class, "providers-display-modal")]');
    @present(By.xpath('.//*[contains(@class, "bx--btn--primary") and not(@disabled)]')) public canSelect: boolean;
    @photo(By.xpath('.//img')) public image: SimplePhoto;
    @label<string>(By.xpath('.//*[@class="bx--modal-header__heading"]')) public title: string;
    @label<string>(By.xpath('.//*[@class="bx--modal-content__text"]')) public description: string;
    public confirm(): Promise<null> {
        return super.confirm(true) as Promise<null>;
    }
}

@injectable export class ProviderFeature extends AbstractFeature {
    protected featureSelector: Locator = By.xpath('.//*[@role="button" and contains(@class, "provider")]');
    @singleCheckbox(By.xpath('self::*'), { checkedSelector: By.xpath('self::*[contains(@class, "provider-selected")]') }) public selected: boolean;
    @photo(By.xpath('.//img')) public image: SimplePhoto;
    @label<string>(By.xpath('.//*[@class="pui-h3"]')) public title: string;
    @label<string>(By.xpath('.//*[@class="provider-description"]')) public description: string;
    public moreInfo(lookForNext: boolean = true): Promise<ProviderModal> {
        return oh.click(By.xpath('.//span[@role="button"]'), this.element).then(() => lookForNext && ProviderModal.WaitForPage<ProviderModal>(ProviderModal));
    }
}