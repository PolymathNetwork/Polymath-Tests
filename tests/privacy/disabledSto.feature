@issuer @sto @sanity
Feature: Capped STO test
    In this test we attempt to create a Capped STO while the privacy mode is disabled

    Background: Investors minted
        Given The issuer is authenticated
        And A token is reserved
        And A token is created
        And Investors are minted

    Scenario: Create a STO positive path with a disabled privacy mode (in-between)
        Given The issuer disables the privacy mode
        Given The issuer selects the a Capped STO
        And The issuer configures and starts the Capped STO
        Then The Capped STO is started