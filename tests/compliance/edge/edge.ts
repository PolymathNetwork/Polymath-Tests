import { TransactionalTest } from "tests/transactionalTest";
import { binding, given } from "cucumber-tsflow";
import { Whitelist } from "objects/pages/withToken/compliance/whitelist";
import { expect } from "framework/helpers";
import { ComplianceItem } from "models/whitelistModel";
import { WhitelistModal } from "objects/features/whitelist/whitelist";
import { AbstractComplianceTest } from "../abstractCompliance";

@binding()
class ComplianceEdgeTests extends AbstractComplianceTest {

    @given(/The issuer uploads a whitelist with (invalid|no) headers/)
    public async addInvestors(condition?: string) {
        this.setWhitelist(async () => {
            let item = new ComplianceItem();
            if (condition === 'invalid') {
                item.ethAddress = item.buyLockup = item.sellLockup = item.kyc = 'This is an invalid header';
                this.data.whitelist.data.addresses = [item].concat(this.data.whitelist.data.addresses);
            }
            this.modal.file = this.data.whitelist.data.toFile({ noHeader: true });
        })
    }
}
export = ComplianceEdgeTests;