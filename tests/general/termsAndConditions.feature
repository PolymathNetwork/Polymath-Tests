Feature: Access the Terms and Conditions Page

    This test aims to check that the terms and conditions page is accessible from the screen.

    Scenario: Access from Homescreen
        Given The issuer navigates to the issue url
        And The issuer connects MetaMask to the app
        And The issuer verifies the identity
        When The issuer selects the terms and conditions link
        Then The issuer sees the terms and conditions page