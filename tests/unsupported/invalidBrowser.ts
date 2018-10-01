import { binding, given } from "cucumber-tsflow/dist";
import { Welcome } from "objects/pages/noToken/homepage/welcome";
import { InvestorSTONotFound } from "objects/pages/investor/notFound";
import { CorePage } from "objects/pages/base";
import { expect } from "framework/helpers";
import { UnsupportedBrowser } from "objects/pages/noToken/lockdown/unsupportedBrowser";

@binding()
class UnsupportedBrowserTests {
    @given(/The user navigates to the issuer page/)
    public async navigateToMainPageIssuer(): Promise<void> {
        let welcome = new Welcome();
        await welcome.navigateToPage();
    }
    @given(/The user navigates to the investor page/)
    public async navigateToMainPageInvestor(): Promise<void> {
        let page = new InvestorSTONotFound();
        await page.navigateToPage(null);
    }
    @given(/The user is blocked from any further interaction/)
    public async interactionsAreBlocked(): Promise<void> {
        let page = await CorePage.WaitForPage<UnsupportedBrowser>(CorePage);
        expect(page).to.be.instanceof(UnsupportedBrowser);
    }
}

export = UnsupportedBrowserTests;