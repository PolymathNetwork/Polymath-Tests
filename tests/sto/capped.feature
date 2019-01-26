@issuer @sto @sanity
Feature: Capped STO test
    This is the test related to the start a token STO Feature

    Background: Investors minted
        Given The issuer is authenticated
        And A token is reserved @optional
        And A token is created @optional
        And Investors are minted @optional

    Scenario: Create a STO positive path
        Given The issuer selects the a Capped STO
        And The issuer configures and starts the Capped STO
        Then The Capped STO is started