@whitelist @full @issuer
Feature: Non-Accredited investor with a negative number
    This test attempts to upload a non-accredited investor with a negative number

    Background: Token is created
        Given The issuer is authenticated
        And A token is reserved
        And A token is created

    Scenario: Non-Accredited negative
        Given The issuer uploads a whitelist with a non-accredited field with negative numbers
        Then The issuer gets an error stating that the file is invalid