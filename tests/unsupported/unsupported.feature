@unsupported @mobile
Feature: Unsupported Browser
    This test ensures that unsupported browsers display a page that blocks any
    further interaction.

    Scenario: Invalid Browser Page / Issuer
        Given The user navigates to the issuer page
        Then The user is blocked from any further interaction

    Scenario: Invalid Browser Page / Investor
        Given The user navigates to the investor page
        Then The user is blocked from any further interaction