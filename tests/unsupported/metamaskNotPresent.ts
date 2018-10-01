import { binding, given } from "cucumber-tsflow/dist";

@binding()
class MetamaskNotPresent {
    @given(/The issuer is asked to install metamask/)
    public async metamaskIsRequired(): Promise<void> {

    }
}

export = MetamaskNotPresent;