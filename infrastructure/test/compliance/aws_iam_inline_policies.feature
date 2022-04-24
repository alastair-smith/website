Feature: AWS IAM Inline Policies
  In order to version and share access levels easier
  all AWS roles shall use managed policies instead of inline policies

Scenario: All AWS IAM roles avoid inline policies
  Given I have aws_iam_role defined
  Then it must not contain inline_policy
