@whitelist @full @issuer
Feature: Compliance test
    This is the test related to the mint a token Feature

    Background: Capped STO launched
        Given The issuer is authenticated
        And A token is reserved
        And A token is created

    Scenario: Invalid Sell Lockup
        Given The issuer uploads a whitelist with an invalid Sell date
        Then The issuer gets an error stating that the file is invalid