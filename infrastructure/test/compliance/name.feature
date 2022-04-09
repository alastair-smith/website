Feature: Resource Names
  In order to find resources easier
  all resources shall follow a consistent naming scheme

  Scenario: Standard resources have names following kebab-case
    Given I have any resource defined
    When it has name
    And its type metadata is not null_resource
    And its type metadata is not aws_dynamodb_table_item
    And its type metadata is not cloudflare_record 
    And its type metadata is not cloudflare_worker_script
    And its type metadata is not aws_cloudwatch_log_group
    Then it must have name
    And its value must match the "^[a-z0-9]+(-[a-z0-9]+)*$" regex

  Scenario: Domain names have names following kebab-case.with-dots
    Given I have cloudflare_record defined
    Then it must have name
    And its value must match the "^([a-z0-9]+(-[a-z0-9]+)*)+(\.([a-z0-9]+(-[a-z0-9]+)*)+)*$" regex

  Scenario: Worker scripts have names following kebab-case_with-underscores
    Given I have cloudflare_worker_script defined
    Then it must have name
    And its value must match the "^([a-z0-9]+(-[a-z0-9]+)*)+(_([a-z0-9]+(-[a-z0-9]+)*)+)*$" regex

  Scenario: Log groups have names following the /kebab-case/with-paths
    Given I have aws_cloudwatch_log_group defined
    Then it must have name
    And its value must match the "^(\/[a-z0-9]+(-[a-z0-9]+)*)+$" regex
