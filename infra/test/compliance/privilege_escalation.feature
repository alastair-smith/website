Feature: Privilege Escalation
  In order to prevent privilege escalation
  AWS IAM roles shall have maximum permission boundaries applied

Scenario: Permission Boundary Present
  Given I have aws_iam_role defined
  Then it must contain permissions_boundary
