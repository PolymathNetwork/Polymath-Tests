@issuer @mint @full
Feature: Mint test
    In this test we try to mint investors with a disabled privacy mode in-between

    Background: Token Created
        Given The issuer is authenticated
        And A token is reserved
        And A token is created

    Scenario: Mint a Token positive path with a disabled privacy mode (in-between)
        Given The issuer disables the privacy mode
        And The issuer verifies the identity
        Given The issuer adds minting data
        Then The issuer mints new investors