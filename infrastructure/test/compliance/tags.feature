Feature: Resource Tags
  In order to identify which project and environment resources belong to
  all resources that support tags should be tagged

  Scenario: Ensure all resources have tags
    Given I have resource that supports tags defined
    Then it must contain tags
    And its value must not be null
  
  # also includes when tags are set at the provider-level
  Scenario Outline: Ensure that tags meet the expected values
    Given I have resource that supports tags_all defined
    When it has tags_all
    Then it must contain tags_all
    Then it must contain "<tags>"
    And its value must match the "<value>" regex

    # Name regex is combination of all the allowed values from name.feature
    Examples:
      | tags        | value     |
      | Name        | ^([a-z0-9]+(-[a-z0-9]+)*)\|(([a-z0-9]+(-[a-z0-9]+)*)+(_([a-z0-9]+(-[a-z0-9]+)*)+)*)\|((\/[a-z0-9]+(-[a-z0-9]+)*)+)$                         |
      | Environment | .+        |
      | Repository  | .+        |
      | Service     | ^website$ |
