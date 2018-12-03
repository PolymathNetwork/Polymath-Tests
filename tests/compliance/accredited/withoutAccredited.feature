@whitelist @full @issuer
Feature: Accredited without non-accredited field
    This test attempts to upload a whitelist containing accredited fields
    but no non-accredited fields.
    This is done without having an STO present.

    Background: Token is created
        Given The issuer is authenticated
        And A token is reserved
        And A token is created

    Scenario: Modify whitelist positive path
        Given The issuer uploads a whitelist without the accredited field
        Then The issuer gets an error stating that the file is invalid