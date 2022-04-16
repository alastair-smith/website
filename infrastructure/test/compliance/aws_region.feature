Feature: AWS Region
  In order to keep track of AWS resources and to have consistent billing
  all non-global AWS resources shall be created in the same region

  Scenario: Ensure all non-global AWS resources are in the same region
    Given I have any provider defined
    When its provider_name is aws
    Then it must contain region
    And its value must be eu-west-1
