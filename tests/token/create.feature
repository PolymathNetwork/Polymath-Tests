@issuer @create @sanity
Feature: Create a token test
    This is the test related to the create a token Feature

    Background: Token Reserved
        Given The issuer is authenticated
        And A token is reserved @optional

    Scenario: Create a Token positive path
        Given The issuer goes to the Create a Token page
        When The issuer creates a token
        Then The issuer has the token created