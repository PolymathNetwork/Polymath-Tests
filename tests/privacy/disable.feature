Feature: App with disabled privacy
    This test attempts a simple sign-in to the application with a disabled privacy mode

    Scenario: Start App with disabled privacy
        Given The issuer disables the privacy mode
        When The issuer navigates to the issue url
        Then The issuer verifies the identity