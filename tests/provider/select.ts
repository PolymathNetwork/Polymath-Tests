import { TransactionalTest } from "tests/transactionalTest";
import { binding, given } from "cucumber-tsflow";
import { IssuerTestData } from "tests/issuerTestData";
import { Providers } from "objects/pages/withToken/providers/providers";
import { oh, assert, expect } from "framework/helpers";

@binding([IssuerTestData])
class ProviderTests extends TransactionalTest {
    private selectRandom<T>(array: Array<T>): Array<T> {
        let totalSelect = oh.chance.natural({ maximum: array.length });
        let copy = Array.from(array);
        for (let i = totalSelect; i < array.length; ++i) {
            copy.splice(oh.chance.natural({ maximum: copy.length }));
        }
        return copy;
    }
    @given(/The issuer selects providers via click/)
    public async selectClick() {
        let page = await Providers.WaitForPage<Providers>(Providers);
        // As the number of providers may vary, it needs to be dynamically allocated
        let copy = this.selectRandom(page.providerNavigation);
        console.log(`Selected ${copy.length} providers: ${copy.map(c => c.title).join(',')}`);
        this.selected = {};
        for (let nav of copy) {
            let content = await nav.next();
            this.selected[nav.title] = [];
            for (let provider of this.selectRandom(content.providers)) {
                provider.selected = true;
                this.selected[nav.title].push(provider.title);
            }
            await content.apply();
        }
    }
    @given(/The issuer selects a provider via popup/)
    public async selectPopup() {
        let page = await Providers.WaitForPage<Providers>(Providers);
        // As the number of providers may vary, it needs to be dynamically allocated
        let copy = this.selectRandom(page.providerNavigation);
        console.log(`Selected ${copy.length} providers: ${copy.map(c => c.title).join(',')}`);
        this.selected = {};
        for (let nav of copy) {
            let content = await nav.next();
            this.selected[nav.title] = [];
            for (let provider of this.selectRandom(content.providers)) {
                let moreInfo = await provider.moreInfo();
                await moreInfo.next();
                this.selected[nav.title].push(provider.title);
            }
        }
    }
    @given(/The issuer selects all the providers/)
    public async selectAll() {
        let page = await Providers.WaitForPage<Providers>(Providers);
        // As the number of providers may vary, it needs to be dynamically allocated
        let copy = this.selectRandom(page.providerNavigation);
        console.log(`Selected ${copy.length} providers: ${copy.map(c => c.title).join(',')}`);
        this.selected = {};
        for (let nav of copy) {
            let content = await nav.next();
            content.selectAll = true;
            await content.apply();
            this.selected[nav.title] = content.providers.map(p => p.title);
        }
    }
    private selected: { [k: string]: string[] }
    @given(/The providers are selected/)
    public async providersSelected() {
        let page = await Providers.WaitForPage<Providers>(Providers);
        for (let prov in this.selected) {
            let provider = page.providerNavigation.find(p => p.title === prov);
            let content = await provider.next();
            for (let selected of this.selected[prov]) {
                let pr = content.providers.find(p => p.title === selected);
                expect(pr, `Provider ${selected} isn't selected`).to.be.not.null;
                expect(pr.selected, `Provider ${selected} isn't selected`).to.be.true;
            }
        }
    }
}

export = ProviderTests;