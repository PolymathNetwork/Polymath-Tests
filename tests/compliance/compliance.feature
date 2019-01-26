@whitelist @full @issuer
Feature: Compliance test
    This is the test related to the mint a token Feature

    Background: Capped STO launched
        Given The issuer is authenticated
        And A token is reserved @optional
        And A token is created @optional
        And Investors are minted @optional
        # Launching an STO is not supported by the ganache configuration
        And Capped STO launched

    Scenario: Modify whitelist positive path
        Given The issuer changes ownership settings
        And The issuer adds investors to the whitelist
        Then The issuer downloads the same investors