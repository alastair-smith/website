# Website
[![Build Status](https://cloud.drone.io/api/badges/alastair-smith/website/status.svg)](https://cloud.drone.io/alastair-smith/website)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Code for my personal website [alsmith.dev](https://alsmith.dev).

## Running locally

1. Install [nodejs](https://nodejs.org/) 14
2. Install the npm modules, build, and run the application
    ```sh
    cd app
    npm ci
    npm run dev
    ```

## Deployment

Deployment is performed in the [drone CI/CD pipeline](https://cloud.drone.io/alastair-smith/website).

[Terraform](https://www.terraform.io/) is used to manage the infrastructure as code.

<!-- unreleated change -->
