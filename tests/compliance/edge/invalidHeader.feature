@whitelist @full @issuer
Feature: Invalid Header
    This test attempts to upload a whitelist with an invalid header.
    The whitelist should be rejected straight away.

    Background: Token is created
        Given The issuer is authenticated
        And A token is reserved
        And A token is created

    Scenario: Invalid Header Whitelist
        Given The issuer uploads a whitelist with invalid headers
        Then The issuer gets an error stating that the file is invalid