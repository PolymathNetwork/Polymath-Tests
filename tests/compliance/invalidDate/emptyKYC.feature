@whitelist @full @issuer
Feature: Compliance test
    This is the test related to the mint a token Feature

    Background: Capped STO launched
        Given The issuer is authenticated
        And A token is reserved
        And A token is created

    Scenario: Empty KYC
        Given The issuer uploads a whitelist with an empty KYC date
        Then The issuer downloads the same investors