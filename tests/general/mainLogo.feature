Feature: Logo brings back to the main page

    This test aims to check that when clicking the main logo,
    the user will be redirected back to the main page

    Scenario: Select the logo on the main screen
        Given The issuer navigates to the issue url
        And The issuer connects MetaMask to the app
        And The issuer verifies the identity
        When The issuer selects the main logo
        Then The issuer is redirected to the main screen