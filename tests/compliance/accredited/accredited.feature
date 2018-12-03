@whitelist @full @issuer
Feature: Accredited
    This test attempts to upload a whitelist with the accredited field when no STO is present.
    This list should be accepted and the download should have the same fields.

    Background: Token is created
        Given The issuer is authenticated
        And A token is reserved
        And A token is created

    Scenario: Accredited Field Whitelist
        Given The issuer uploads a whitelist with the accredited field
        Then The issuer downloads the same investors