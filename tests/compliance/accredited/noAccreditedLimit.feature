@whitelist @full @issuer
Feature: Non-accredited without an STO
    This test attempts to upload a whitelist with a valid value non-accredited value.
    No STO is present with this test.

    Background: Token is created
        Given The issuer is authenticated
        And A token is reserved
        And A token is created

    Scenario: Modify whitelist positive path
        Given The issuer uploads a whitelist with the accredited and non-accredited field
        Then The issuer downloads the same investors