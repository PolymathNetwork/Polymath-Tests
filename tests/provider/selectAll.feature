@issuer @provider @sanity
Feature: Select a provider
    This is the test related to the select a provider Feature

    Background: Token Reserved
        Given The issuer is authenticated
        And A token is reserved

    Scenario: Select all providers
        Given The issuer selects all the providers
        Then The providers are selected