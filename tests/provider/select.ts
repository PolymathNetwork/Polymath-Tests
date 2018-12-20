import { TransactionalTest } from "tests/transactionalTest";
import { binding, given } from "cucumber-tsflow";
import { IssuerTestData } from "tests/issuerTestData";
import { Providers } from "objects/pages/withToken/providers/providers";
import { oh, assert, expect } from "framework/helpers";

@binding([IssuerTestData])
class ProviderTests extends TransactionalTest {
    private selectRandom<T>(array: Array<T>): Array<T> {
        let totalSelect = oh.chance.natural({ maximum: array.length });
        let copy: Array<T> = Array.from(array);
        for (let i = totalSelect; i < array.length; ++i) {
            copy.splice(oh.chance.natural({ maximum: copy.length }), 1);
        }
        return copy;
    }
    @given(/The issuer selects providers via click/)
    public async selectClick() {
        let page = await Providers.WaitForPage<Providers>(Providers);
        await page.init();
        // As the number of providers may vary, it needs to be dynamically allocated
        let copy = this.selectRandom(page.providerNavigation);
        console.log(`Selected ${copy.length} providers: ${copy.map(c => c.title).join(',')}`);
        this.selected = {};
        for (let nav of copy) {
            let content = await nav.next();
            await content.init();
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
        await page.init();
        // As the number of providers may vary, it needs to be dynamically allocated
        let copy = this.selectRandom(page.providerNavigation);
        console.log(`Selected ${copy.length} providers: ${copy.map(c => c.title).join(',')}`);
        this.selected = {};
        for (let nav of copy) {
            let content = await nav.next();
            await content.init();
            this.selected[nav.title] = [];
            for (let provider of this.selectRandom(content.providers)) {
                let moreInfo = await provider.moreInfo();
                await moreInfo.next();
                this.selected[nav.title].push(provider.title);
            }
        }
    }
    @given(/The issuer sends his information to the providers/)
    public async apply() {
        let page = await Providers.WaitForPage<Providers>(Providers);
        await page.init();
        let actualPage = page.providerNavigation.find(el => el.actual);
        let oldApplied = actualPage.applied;
        let toApply = page.providers.providers.map((el, idx) => { { return { el: el, idx: idx } } })
            .filter(el => el.el.selected || el.el.applied);
        let oldSelected = page.providers.providers.filter(el => el.applied).length;
        expect(oldApplied, "The selected number on the top of the page").to.be.equal(oldSelected, "The number of already applied items");
        let dialog = await page.providers.applySelected();
        await dialog.fill(this.data.issuerInfo);
        await dialog.next();
        await page.refresh();
        actualPage = page.providerNavigation.find(el => el.actual);
        expect(actualPage.applied).to.be.equal(toApply.length);
        let newApplied = page.providers.providers.map((el, idx) => { { return { el: el, idx: idx } } })
            .filter(el => el.el.applied);
        expect(newApplied.map(el => el.idx), "Applied providers")
            .to.be.equal(toApply.map(el => el.idx), "Should be equalling the previous applied plus the old selected");
        expect(page.providers.providers.filter(el => el.selected).length, "Selected providers")
            .to.be.equal(0, "Should be empty after applying them");
        // TODO: Check emails
    }
    @given(/The issuer selects all the providers/)
    public async selectAll() {
        let page = await Providers.WaitForPage<Providers>(Providers);
        await page.init();
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
        await page.init();
        for (let prov in this.selected) {
            let provider = page.providerNavigation.find(p => p.title === prov);
            let content = await provider.next();
            await content.init();
            for (let selected of this.selected[prov]) {
                let pr = content.providers.find(p => p.title === selected);
                expect(pr, `Provider ${selected} isn't selected`).to.be.not.null;
                expect(pr.selected, `Provider ${selected} isn't selected`).to.be.true;
            }
        }
    }
}

export = ProviderTests;