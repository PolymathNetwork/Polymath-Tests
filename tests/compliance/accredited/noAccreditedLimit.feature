@whitelist @full @issuer
Feature: Non-accredited without an STO
    This test attempts to upload a whitelist with a valid value non-accredited value.
    This test sports no STO.

    Background: Token is created
        Given The issuer is authenticated
        And A token is reserved @optional
        And A token is created @optional

    Scenario: Modify whitelist positive path
        Given The issuer uploads a whitelist with the accredited and non-accredited field
        Then The issuer downloads the same investors