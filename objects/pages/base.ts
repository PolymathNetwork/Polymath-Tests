import { AbstractPage, optional } from "framework/object/abstract";
import { Header } from "objects/features/general/header";
import { NoticeFeature } from "../features/general/notice";
import { FooterFeature } from "objects/features/general/footer";

export abstract class CorePage extends AbstractPage {
    public async navigateToPage(uri?: string): Promise<this> {
        await super.navigateToPage(uri);
        await CorePage.WaitForPage(CorePage);
        return this;
    }
    @optional public notice?: NoticeFeature = new NoticeFeature(this);
    public footer: FooterFeature = new FooterFeature(this);
}

export abstract class IssuerPage extends CorePage { }

export abstract class PageWithHeader extends IssuerPage {
    public header: Header = new Header(this);
}