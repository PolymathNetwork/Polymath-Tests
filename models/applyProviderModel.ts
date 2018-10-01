import { IDataModelObject } from "framework/object/core";
import { oh } from "framework/helpers";


export class ApplyProviderModel extends IDataModelObject {
    public name: string = oh.chance.string();
    public description: string = oh.chance.string();
    public jurisdictionOperation: string = oh.chance.string();
    public jurisdictionIncorporation: string = oh.chance.string();
    public corporatePresentation: string = oh.chance.url();
    public managementBoardProfiles: string = oh.chance.url();
    public corporateStructure: string = oh.chance.url();
    public otherDetails: string = oh.chance.stringOrNone();
}