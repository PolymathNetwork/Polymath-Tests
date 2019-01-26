@whitelist @full @issuer
Feature: Compliance test
    This is the test related to the mint a token Feature

    Background: Capped STO launched
        Given The issuer is authenticated
        And A token is reserved @optional
        And A token is created @optional

    Scenario: Empty Sell
        Given The issuer uploads a whitelist with an empty Sell date
        Then The issuer downloads the same investors