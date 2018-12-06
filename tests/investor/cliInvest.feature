Feature: Normal invest for an investor
    This test checks that valid tokens are properly detected and accepted

    Background: An STO is started
        Given The issuer is authenticated
        And A token is reserved
        And A token is created
        And Investors are minted
        And Capped STO launched immediately
        And 3 known addresses are whitelisted

    Scenario: Invest in a token
        Given The investor authenticates in the CLI with account number 2
