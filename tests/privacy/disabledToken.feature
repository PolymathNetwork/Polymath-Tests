@issuer @sanity
Feature: Create a token while disabling the privacy mode
    This test creates a token while disabling the privacy mode 'in-between'.

    Background: Token Reserved
        Given The issuer is authenticated
        And A token is reserved @optional

    Scenario: Create a Token with a disabled privacy mode
        Given The issuer disables the privacy mode
        Given The issuer creates a token
        Then The issuer has the token created