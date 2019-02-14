import { binding, given } from "cucumber-tsflow";
import { CorePage } from "objects/pages/base";
import { PrivacyPage } from "objects/features/general/footer";
import { expect } from "framework/helpers";

@binding()
class Privacy {
    public result: PrivacyPage;

    @given(/The issuer selects the privacy link/)
    public async select() {
        let page = await CorePage.Get<CorePage>(CorePage);
        this.result = await page.footer.privacy();
    }
    @given(/The issuer sees the privacy page/)
    public seesPage() {
        expect(this.result).to.be.instanceOf(PrivacyPage);
    }
}
export = Privacy;