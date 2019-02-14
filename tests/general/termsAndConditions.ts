import { binding, given } from "cucumber-tsflow";
import { CorePage } from "objects/pages/base";
import { TermsPage } from "objects/features/general/footer";
import { expect } from "framework/helpers";

@binding()
class TermsAndConditions {
    public result: TermsPage;

    @given(/The issuer selects the terms and conditions link/)
    public async select() {
        let page = await CorePage.Get<CorePage>(CorePage);
        this.result = await page.footer.terms();
    }
    @given(/The issuer sees the terms and conditions page/)
    public seesPage() {
        expect(this.result).to.be.instanceOf(TermsPage);
    }
}
export = TermsAndConditions;