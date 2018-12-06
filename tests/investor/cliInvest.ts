import { binding, given } from "cucumber-tsflow";

@binding()
class CLIInvest {
    @given(/The investor authenticates in the CLI with account number (\d+)/)
    public async investCli(account: string) {
        throw `Not implemented - Invest with CLI`;
    }
}
export = CLIInvest;