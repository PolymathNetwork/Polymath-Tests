@whitelist @full @issuer
Feature: Compliance test
    This test attempts to upload a whitelist without a header.
    The file should be rejected straight away.

    Background: Token is created
        Given The issuer is authenticated
        And A token is reserved
        And A token is created

    Scenario: No Header Whitelist
        Given The issuer uploads a whitelist with no headers
        Then The issuer gets an error stating that the file is invalid