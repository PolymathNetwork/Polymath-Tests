import { binding, given } from "cucumber-tsflow";
import { oh } from "framework/helpers";
import { Modal } from "objects/features/general/modal";
import { AbstractComplianceTest } from "../abstractCompliance";
import { IssuerTestData } from "tests/issuerTestData";

@binding([IssuerTestData])
class ComplianceAccreditedTests extends AbstractComplianceTest {
    @given(/The issuer uploads a whitelist with the accredited field/)
    public async whitelistWithAccredited() {
        await this.setWhitelist(async () => {
            this.data.whitelist.data.addresses.forEach((address, idx) => address.isAccredited = idx % 2 === 0);
            this.modal.file = this.data.whitelist.data.toFile();
        });
        await this.approveTransactions(() => this.modal.next() as Promise<Modal>);
    }

    @given(/The issuer uploads a whitelist without non-accredited fields/)
    public async emptyNonAccredited() {
        await this.setWhitelist(async () => {
            this.data.whitelist.data.addresses.forEach(el => el.nonAccreditedLimit = null);
            this.modal.file = this.data.whitelist.data.toFile({ noNonAccreditedLimit: true });
        });
        await this.approveTransactions(() => this.modal.next() as Promise<Modal>);
    }

    @given(/The issuer uploads a whitelist with the accredited and non-accredited field/)
    public async fullNonAccredited() {
        await this.setWhitelist(async () => {
            this.data.whitelist.data.addresses.forEach((address) =>
                (address.nonAccreditedLimit = oh.chance.natural()) &&
                (address.isAccredited = oh.chance.bool()));
            this.modal.file = this.data.whitelist.data.toFile();
        });
        await this.approveTransactions(() => this.modal.next() as Promise<Modal>);
    }

    @given(/The issuer uploads a whitelist with a non-accredited field with negative numbers/)
    public async nonAccreditedNegative() {
        await this.setWhitelist(async () => {
            this.data.whitelist.data.addresses.forEach((address, idx) => address.nonAccreditedLimit = (idx % 2 ? address.nonAccreditedLimit : -address.nonAccreditedLimit));
            this.modal.file = this.data.whitelist.data.toFile();
        });
    }

    @given(/The issuer uploads a whitelist without accredited fields/)
    public async noAccreditedFields() {
        await this.setWhitelist(async () => {
            this.data.whitelist.data.addresses.forEach(el => el.isAccredited = el.nonAccreditedLimit = null);
            this.modal.file = this.data.whitelist.data.toFile({ noNonAccreditedLimit: true, noIsAccredited: true });
        });
    }

}
export = ComplianceAccreditedTests;