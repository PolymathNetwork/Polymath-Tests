import { Import } from ".";
import { Locator, By } from "framework/helpers";
import { injectable } from "framework/object/core/iConstructor";
import { Detail } from "../detail";


@injectable export class NewImport extends Import {
    protected featureSelector: Locator = By.xpath('.//body[@class="NOTIMPLEMENTED"]');
    public password: string;
    public seed: string;
    public async next(lookForNext: boolean = true): Promise<Detail> { return null; }
}