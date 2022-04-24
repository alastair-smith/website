Feature: AWS IAM Inline Policies
  In order to version and share access levels easier
  all AWS roles shall use managed policies instead of inline policies

Scenario: All AWS IAM roles disallow inline policies
  Given I have aws_iam_role defined
  Then it must contain inline_policy
  And its value must be ""
