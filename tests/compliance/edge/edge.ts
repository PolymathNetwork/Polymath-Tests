import { binding, given } from "cucumber-tsflow";
import { ComplianceItem } from "models/whitelistModel";
import { AbstractComplianceTest } from "../abstractCompliance";
import { IssuerTestData } from "tests/issuerTestData";

@binding([IssuerTestData])
class ComplianceEdgeTests extends AbstractComplianceTest {

    @given(/The issuer uploads a whitelist with (invalid|no) headers/)
    public async addInvestors(condition?: string) {
        await this.setWhitelist(async () => {
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