Feature: Access the Privacy Page

    This test aims to check that the privacy page is accessible from the screen.

    Scenario: Access from Homescreen
        Given The issuer navigates to the issue url
        And The issuer connects MetaMask to the app
        And The issuer verifies the identity
        When The issuer selects the privacy link
        Then The issuer sees the privacy page