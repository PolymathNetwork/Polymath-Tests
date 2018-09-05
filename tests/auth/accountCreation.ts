import { TransactionalTest } from "tests/issuerTest";
import { given, binding } from "cucumber-tsflow";
import { IssuerPage } from "objects/pages/base";
import { EmailVerification } from "objects/pages/noToken/account/emailVerification";
import { AccountPage } from "objects/pages/noToken/account/createAccount";
import { expect } from "framework/helpers";

@binding()
export class AccountCreation extends TransactionalTest {
    @given(/The issuer creates an account/)
    public async createAnAccount() {
        let page: AccountPage = await IssuerPage.WaitForPage(IssuerPage) as AccountPage;
        if (!(page instanceof AccountPage)) {
            console.warn('WARNING: An account already exists for the user, skipping creation.');
            return;
        }
        expect(page).to.be.instanceof(AccountPage);
        await page.account.fill(this.data.user);
        await page.account.next();
    }

    @given(/The issuer activates his account/)
    public async activateAccount() {
        let email = await IssuerPage.Get<IssuerPage>(IssuerPage) as EmailVerification;
        if (!(email instanceof EmailVerification)) {
            console.log('WARNING: Not activating account as it\'s already activated');
            return;
        }
        let pinInput = await email.verify.next();
        let confirmation = await pinInput.next(this.data.user.email, this.data.email);
        await confirmation.next();
    }
}