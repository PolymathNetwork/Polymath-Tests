import { binding, given } from "cucumber-tsflow";
import { Metamask } from "extensions/metamask";

@binding()
class DisablePrivacy {
    @given(/The issuer disables the privacy mode/)
    public async connectMetaMask() {
        await Metamask.instance.setSettings({ privacyMode: false });
    }
}
export = DisablePrivacy