Feature: Provider Credentials
  In order to keep access to cloud accounts secure
  no credentials shall be stored in provider config

Scenario Outline: Ensure no AWS keys are hardcoded
  Given I have aws provider configured
  Then it must not contain "<field>"

  Examples:
    | field                |
    | access_key           |
    | secret_key           |
    | token                |

Scenario Outline: Ensure no Cloudflare keys are hardcoded
  Given I have cloudflare provider configured
  Then it must not contain "<field>"

  Examples:
    | field                |
    | email                |
    | api_key              |
    | api_token            |
    | api_user_service_key |
    | account_id           |
