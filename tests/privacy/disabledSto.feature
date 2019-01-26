@issuer @sto @sanity
Feature: Capped STO test
    This test attempts to create a Capped STO while the privacy mode is disabled

    Background: Investors minted
        Given The issuer is authenticated
        And A token is reserved @optional
        And A token is created @optional
        And Investors are minted @optional

    Scenario: Create a STO positive path with a disabled privacy mode (in-between)
        Given The issuer disables the privacy mode
        Given The issuer selects the a Capped STO
        And The issuer configures and starts the Capped STO
        Then The Capped STO is started