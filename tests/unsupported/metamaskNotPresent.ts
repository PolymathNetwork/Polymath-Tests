import { binding, given } from "cucumber-tsflow/dist";
import { CorePage } from "objects/pages/base";
import { expect } from "framework/helpers";
import { MetamaskNotPresent } from "objects/pages/noToken/lockdown/metamaskNotPresent";

@binding()
class MetamaskNotPresentTest {
    @given(/The issuer is asked to install metamask/)
    public async metamaskIsRequired(): Promise<void> {
        let page = await CorePage.WaitForPage<MetamaskNotPresent>(CorePage);
        expect(page).to.be.instanceof(MetamaskNotPresent);
    }
}

export = MetamaskNotPresentTest;