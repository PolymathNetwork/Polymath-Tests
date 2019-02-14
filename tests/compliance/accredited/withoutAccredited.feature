@whitelist @full @issuer
Feature: No accredited fields
    This test attempts to upload a whitelist containing no accredited fields.
    This is done without having an STO present.

    Background: Token is created
        Given The issuer is authenticated
        And A token is reserved @optional
        And A token is created @optional

    Scenario: No accredited fields
        Given The issuer uploads a whitelist without accredited fields
        Then The issuer gets an error stating that the file is invalid