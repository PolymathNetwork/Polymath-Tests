@unsupported @mobile
Feature: Unsupported Browser
    This test ensures that supported browsers that do not have metmask installed
    display a page that blocks any further interaction.

    Scenario: Metamask is not present / Issuer
        Given The issuer navigates to the issue url
        Then The issuer is asked to install metamask

    Scenario: Metamask is not present / Investor
        Given The user navigates to the investor page
        Then The issuer is asked to install metamask