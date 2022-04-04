Feature: Resource Names
  In order to find resources easier
  all resources shall follow a consistent naming scheme

  Scenario: Standard resources
    Given I have resource that supports name defined
    When its type is not null_resource
    Then it must have name
    And its value must match the ".*" regex
