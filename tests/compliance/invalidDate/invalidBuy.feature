@whitelist @full @issuer
Feature: Compliance test
    This is the test related to the mint a token Feature

    Background: Capped STO launched
        Given The issuer is authenticated
        And A token is reserved @optional
        And A token is created @optional

    Scenario: Invalid Buy Lockup
        Given The issuer uploads a whitelist with an invalid Buy date
        Then The issuer gets an error stating that the file is invalid
