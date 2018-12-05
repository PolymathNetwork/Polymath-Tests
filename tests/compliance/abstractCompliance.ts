import { TransactionalTest } from "tests/transactionalTest";
import { Whitelist } from "objects/pages/withToken/compliance/whitelist";
import { expect } from "framework/helpers";
import { WhitelistModal } from "objects/features/whitelist/whitelist";
import { given, binding } from "cucumber-tsflow";

@binding()
export class AbstractComplianceTest extends TransactionalTest {
    public modal: WhitelistModal;
    public async setWhitelist(setFn: () => Promise<void>) {
        let whitelist = await new Whitelist().navigation.navigate(Whitelist);
        expect(whitelist).to.be.not.null;
        this.modal = await whitelist.whitelist.import();
        await setFn();
        await this.modal.apply();
    }

    @given(/The issuer gets an error stating that the file is invalid/)
    public async uploadError() {
        let modal = await new WhitelistModal().load();
        await modal.init();
        expect(modal.hasError).to.be.true;
    }
}