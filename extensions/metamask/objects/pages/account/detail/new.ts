import { Detail } from ".";
import { Locator, By } from "framework/helpers";
import { injectable } from "framework/object/core/iConstructor";


@injectable export class NewDetail extends Detail {
    protected featureSelector: Locator = By.xpath('.//body[@class="NOTIMPLEMENTED"]');
    public name: string;
    public ethAmount: number;
    public ethAddress: string;
}