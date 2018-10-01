import { binding, given } from "cucumber-tsflow/dist";
import { Welcome } from "objects/pages/noToken/homepage/welcome";
import { InvestorSTONotFound } from "objects/pages/investor/notFound";

@binding()
class UnsupportedBrowser {
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

    }
}

export = UnsupportedBrowser;