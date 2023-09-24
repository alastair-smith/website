# Website

[![Build Status](https://cloud.drone.io/api/badges/alastair-smith/website/status.svg)](https://cloud.drone.io/alastair-smith/website)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Code for my personal website [alsmith.dev](https://alsmith.dev).

## Running locally

1. Install [nodejs](https://nodejs.org/) `14.x.x`
2. Install the npm modules, build, and run the application
   ```sh
   cd app
   npm ci
   npm run dev
   ```

## Deployment

Deployment is performed in the [drone CI/CD pipeline](https://cloud.drone.io/alastair-smith/website).

The following secrets need to be set in drone:

| Secret Name             | Description                                                                                                         |
| :---------------------- | :------------------------------------------------------------------------------------------------------------------ |
| `AWS_ACCESS_KEY_ID`     | Access key for AWS IAM user with suitable permisssions for deploying                                                |
| `AWS_SECRET_ACCESS_KEY` | Secret key for AWS IAM user with suitable permissions for deploying                                                 |
| `CLOUDFLARE_API_TOKEN`  | API token for Cloudflare with suitable permission for deploying workers                                             |
| `CLOUDFLARE_EMAIL`      | Email for Cloudflare user associated with the API token                                                             |
| `dockersecret`          | [Config](https://docs.drone.io/pipeline/docker/syntax/images/) with dockerhub credentials for bypassing pull limits |
| `PACKAGE_BUCKET`        | Name of a suitably configured S3 bucket for storing build artifacts                                                 |
| `SLACK_WEBHOOK`         | Slack app webhook for posting pipeline outcomes                                                                     |
| `STATE_BUCKET`          | Name of a suitably configured S3 bucket for storing terraform state                                                 |

[Terraform](https://www.terraform.io/) `1.1.7` is used to manage the infrastructure as code.
