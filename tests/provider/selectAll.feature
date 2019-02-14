@issuer @provider @sanity
Feature: Select a provider
    This is the test related to the select a provider Feature

    Background: Token Reserved
        Given The issuer is authenticated
        And A token is reserved @optional

    Scenario: Select all providers
        Given The issuer selects all the providers
        When The providers are selected
        Then The issuer sends his information to the providers