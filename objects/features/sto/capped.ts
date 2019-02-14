import { injectable } from "framework/object/core/iConstructor";
import { Locator, By, oh } from "framework/helpers";
import { label, present } from "framework/object/core/decorators";
import { StoWidget } from "./abstract";
import { CappedStoConfig } from "./capped.config";

@injectable export class CappedSto extends StoWidget {
    protected featureSelector: Locator = By.xpath('.//*[contains(@class, "sto-factory")]');
    @label<string>(By.xpath('.//p[starts-with(text(), "0x")]')) public ethAddress: string;
    @label<string>(By.xpath('.//*[@class="bx--form-item"][./label[text()="Description"]]/p')) public description: string;
    @present(By.xpath('.//*[@name="checkmark--glyph"]')) public verifiedOnEtherscan: boolean;
    @present(By.xpath('.//*[contains(@class, "bx--tag--ibm")]')) public allowsEth: boolean;
    @present(By.xpath('.//*[contains(@class, "bx--tag--custom")]')) public allowsPoly: boolean;
    @present(By.xpath('.//button[contains(@class, "bx--btn--primary")]')) public hasNext: boolean;
    public seeOnEtherscan() {
        // TODO: Implement Etherscan parser
        return oh.click(By.xpath('.//button[contains(@class, "see-on-etherscan-link")]'), this.element);
    }
    public next(): Promise<CappedStoConfig> {
        if (this.hasNext === false) throw `This widget doesn't support the next() function`;
        return oh.click(By.xpath('.//button[contains(@class, "bx--btn--primary")]'), this.element).then(() => CappedStoConfig.WaitForPage<CappedStoConfig>(CappedStoConfig));
    }
}