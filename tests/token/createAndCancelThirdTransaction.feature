@issuer @create @sanity
Feature: Create a token test cancelling the third transaction
    This test aims see whether the application properly detects that a token was
    already created when the issuer cancels the third transaction (limit number of investors)

    Background: Token Reserved
        Given The issuer is authenticated
        And A token is reserved @optional

    Scenario: Create a Token positive path
        Given The issuer goes to the Create a Token page
        When The issuer cancels the limit number of investors transaction
        Then The issuer has the token created