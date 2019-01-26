@issuer @mint @full
Feature: Mint test
    This test tries to mint investors with a disabled privacy mode in-between

    Background: Token Created
        Given The issuer is authenticated
        And A token is reserved @optional
        And A token is created @optional

    Scenario: Mint a Token positive path with a disabled privacy mode (in-between)
        Given The issuer disables the privacy mode
        Given The issuer adds minting data
        Then The issuer mints new investors