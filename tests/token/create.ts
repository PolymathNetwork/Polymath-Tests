import { binding, given, then } from "cucumber-tsflow";
import { TransactionalTest } from "tests/transactionalTest";
import { IssuerTestData } from "tests/issuerTestData";
import { CreateToken } from "objects/pages/withToken/token/createToken";
import { expect } from "framework/helpers";
import { MintPage } from "objects/pages/withToken/token/mint";
import { Providers } from "objects/pages/withToken/providers/providers";

@binding([IssuerTestData])
class CreateTokenTest extends TransactionalTest {

    @given(/The issuer goes to the Create a Token page/)
    public async goToCreateToken() {
        let providers = await Providers.WaitForPage(Providers) as Providers;
        expect(providers).to.be.instanceof(Providers);
        let modal = await providers.createToken.next();
        await modal.next(true); // I consulted with my advisors
    }

    @given(/The issuer creates a token/)
    public async startNewToken() {
        let page = await new CreateToken().load(); // Can't navigate to the page anymore, as the nav link is disabled
        expect(page).to.be.instanceof(CreateToken);
        await page.create.fill(this.data.tokenInfo);
        await this.approveTransactions(() => page.create.next());
    }

    @given(/The issuer cancels the limit number of investors transaction/)
    public async cancelLimitInvestorsTransaction() {
        let page = await new CreateToken().load(); // Can't navigate to the page anymore, as the nav link is disabled
        expect(page).to.be.instanceof(CreateToken);
        this.data.tokenInfo.maxInvestors = 100;
        this.data.tokenInfo.allowMaxInvestors = true;
        await page.create.fill(this.data.tokenInfo);
        let transaction = await TransactionalTest.GoToTransactions(() => page.create.next());
        await TransactionalTest.MassApproveTransactions(transaction, true, 2);
        await transaction.handleTransaction(true);
        // Now we should have a dialog
        await transaction.refresh();
        expect(transaction.failed, "Transaction should have failed").to.be.true;
        await transaction.next();
        // We should be brought to the next screen now
    }

    @then(/The issuer has the token created/)
    public async tokenIsCreated() {
        let page = await MintPage.WaitForPage(MintPage);
        expect(page).to.be.instanceof(MintPage);
    }

    @given(/A token is created/)
    public async createAToken() {
        await this.goToCreateToken();
        await this.startNewToken();
        await this.tokenIsCreated();
    }
}

export = CreateTokenTest;