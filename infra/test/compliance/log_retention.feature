Feature: Log Retention
  In order to prevent high cost
  logs shall only be kept for a finite duration

Scenario: AWS CloudWatch retention policy set
  Given I have aws_cloudwatch_log_group defined
  Then it must contain retention_in_days
  And its value must be greater than 0
