Feature: Resource Names
  In order to find resources easier
  all resources shall follow a consistent naming scheme

  Scenario: Standard resources
    Given I have any resource defined
    When it has name
    And its type is not null_resource
    And its type is not aws_dynamodb_table_item
    Then it must have name
    And its value must match the ".*" regex
