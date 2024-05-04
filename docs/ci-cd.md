# CI / CD

## 🔎 Checks

Once a PR has been opened then a branch is checked for the following:

- Unit tests passing
- Matches coding style
- Code is compliant to best practices
- Identify and vulnerable dependencies
- Spelling mistakes
- Valid code

## 👷 Build

Once the basic checks have passed then a build is completed and the code is stored in an AWS S3 bucket.

This code is automatically deleted after 14 days to save space. If a redeploy is required then a new artifact should be built.

## 🚀 Deployment

The deployment does not require git access or the full code base to operate, it pulls the build and then performs steps from there.

So if all those checks are passing then the code is deployed to an environment for further testing.
The nature of this environment depends on what has changed.

If changes just impact a single component then just that component is deployed to be tested.

This component can then be tested in the temporary environment and is discarded once the PR is closed/merged.

Upon merging the code a full deployment is ran, updating any infrastructure or application changes.
