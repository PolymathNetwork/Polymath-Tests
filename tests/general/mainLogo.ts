import { binding, given } from "cucumber-tsflow";
import { PageWithHeader } from "objects/pages/base";
import { expect } from "framework/helpers";
import { Welcome } from "objects/pages/noToken/homepage/welcome";

@binding()
class Privacy {
    public result: Welcome;

    @given(/The issuer selects the main logo/)
    public async select() {
        let page = await PageWithHeader.Get<PageWithHeader>(PageWithHeader);
        this.result = await page.header.logo() as Welcome;
    }
    @given(/The issuer is redirected to the main screen/)
    public seesPage() {
        expect(this.result).to.be.instanceOf(Welcome);
    }
}
export = Privacy;