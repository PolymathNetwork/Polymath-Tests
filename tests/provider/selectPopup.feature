@issuer @provider @sanity
Feature: Select a provider
    This is the test related to the select a provider Feature

    Background: Token Reserved
        Given The issuer is authenticated
        And A token is reserved @optional

    Scenario: Select a provider via popup
        Given The issuer selects a provider via popup
        When The providers are selected
        Then The issuer sends his information to the providers