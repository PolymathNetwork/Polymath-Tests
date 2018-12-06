import { binding, given } from "cucumber-tsflow";
import { oh } from "framework/helpers";
import { Modal } from "objects/features/general/modal";
import { AbstractComplianceTest } from "../abstractCompliance";
import { IssuerTestData } from "tests/issuerTestData";

@binding([IssuerTestData])
class ComplianceInvalidDateTests extends AbstractComplianceTest {
    @given(/The issuer uploads a whitelist with an (invalid|empty) (KYC|Sell|Buy) date/)
    public async whitelistWithAccredited(action: string, field: string) {
        await this.setWhitelist(async () => {
            let selectedAddress = this.data.whitelist.data.addresses[oh.chance.natural({ max: this.data.whitelist.data.addresses.length })];
            let value = action === 'invalid' ? 'This is an invalid date' : '';
            switch (field) {
                case 'KYC': selectedAddress.kyc = value; break;
                case 'Sell': selectedAddress.sellLockup = value; break;
                case 'Buy': selectedAddress.buyLockup = value; break;
                default: throw `Compliance Test: Unknown field ${field}`;
            }
            this.modal.file = this.data.whitelist.data.toFile();
        });
        if (action !== 'invalid') {
            await this.approveTransactions(() => this.modal.next() as Promise<Modal>);
        }
    }
}
export = ComplianceInvalidDateTests;