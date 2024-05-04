# Test Compliance

## About

[BDD (Behaviour Driven Development)](https://en.wikipedia.org/wiki/Behavior-driven_development) tests written using [terraform-compliance](https://terraform-compliance.com/) to verify terraform plans meet some fundamental standards.

This is best ran in the CI pipeline just after a terraform plan has been created.

Some of the features tested include:

- Mandatory tags have been applied to resources
- No hard-coded credentials
- Resource naming conventions

## Running Locally

> Requires [Python3](https://www.python.org/downloads/)

> Requires [terraform](https://www.terraform.io/downloads) version matching [`infrastructure/providers.tf`](../../providers.tf)

1. Initialise the terraform repository

   ```bash
   terraform init
   ```

1. Place a copy of the terraform plan at `infrastructure/tfplan`

   - Force the pipeline to upload the plan file to S3 and download it to your local machine - this will provide you with the most accurate values

   OR

   - Generate a plan locally

1. Install terraform-compliance

   ```bash
   python3 -m venv venv
   . venv/bin/activate
   pip install terraform-compliance
   ```

1. Run terraform-compliance

   ```bash
   terraform-compliance -f ./test/compliance/ -p ./tfplan
   ```

## Adding Features

Feature files can be added in this directory. They must be named in snake case and have the `.feature` file extension.

Scenarios should be simple and as human-readable as possible to preserve the BDD benefits.

If a scenario features complicated regex then the scenario name should signify what the regex is checking for.

All feature files should meet the gherkin linter rules in [`infrastructure/test/compliance/.gherkin-lintrc`](./.gherkin-lintrc). These are validated in the CI pipeline, but can be ran locally by installing [NodeJS](https://nodejs.org/en/) and then running the following in the compliance directory:

```bash
npx gherkin-linter
```

For specific information about adding scenarios see [terraform compliance documentation](https://terraform-compliance.com/).
