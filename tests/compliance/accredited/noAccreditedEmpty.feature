@whitelist @full @issuer
Feature: Whitelist with non-accredited empty field
    This test attempts to uplaod a whitelist with an empty non-accredited field.

    Background: Token is created
        Given The issuer is authenticated
        And A token is reserved
        And A token is created

    Scenario: Non accredited investor with an empty field
        Given The issuer uploads a whitelist with an empty non-accredited field
        Then The issuer downloads the same investors