def main(ctx):
    return [validate, build, deploy, test, destroy, report]


def extend_default(pipeline):
    return dict(default_pipeline_config.items() + pipeline.items())


node_version = "14.18.1"
node_image_sha256 = "240e1e6ef6dfba3bb70d6e88cca6cbb0b5a6f3a2b4496ed7edc5474e8ed594bd"

images = {
    "alpine": "alpine:latest@sha256:21a3deaa0d32a8057914f36584b5288d2e5ecc984380bc0118285c70fa8c9300",
    "amazon linux": "amazonlinux:latest@sha256:f3a37f84f2644095e2c6f6fdf2bf4dbf68d5436c51afcfbfa747a5de391d5d62",
    "aws cli": "amazon/aws-cli:latest@sha256:2635a0726dc3b9383718baecae23a8ab9e8959edb8b3a5cc91a410c236ac11f5",
    "nodejs": "node:" + node_version + "-alpine@sha256:" + node_image_sha256,
    "terraform": "hashicorp/terraform:1.1.7@sha256:ef828667eca97a3ad9b8f26918b68170bcb3066cd9ba9540da73a608c6b4a2bb",
    "terraform compliance": "eerkunt/terraform-compliance:1.3.32@sha256:5d284c24f22cb84b0c2affe94cbab104e4fe86097ec07445879194c2ee919b04",
    "tflint": "ghcr.io/terraform-linters/tflint-bundle:v0.35.0.0@sha256:9dd720df78a2dd55fac9d7d85ec79ec5f16ebe50ceb94aa97e5d3cc34c69f693",
    "python": "python:3.9@sha256:1fb89e1a6f8e739f2a274e745b80d11b1fdad72860489c1794ef13aa5fd69f94",
    "slack": "plugins/slack@sha256:57fb90fd174908c0f5be58fd11b5bf1c420807c64a934c4a346a9b257b6495ba",
}

slack_webhook = {"from_secret": "SLACK_WEBHOOK"}

aws_default_region = "eu-west-1"
aws_credentials = {
    "AWS_ACCESS_KEY_ID": {"from_secret": "AWS_ACCESS_KEY_ID"},
    "AWS_SECRET_ACCESS_KEY": {"from_secret": "AWS_SECRET_ACCESS_KEY"},
    "AWS_DEFAULT_REGION": aws_default_region,
    "AWS_REGION": aws_default_region,
}

cloudflare_credentials = {
    "CLOUDFLARE_API_TOKEN": {"from_secret": "CLOUDFLARE_API_TOKEN"},
    "CLOUDFLARE_ACCOUNT_ID": {"from_secret": "CLOUDFLARE_ACCOUNT_ID"},
}

package_bucket_variable = {"PACKAGE_BUCKET": {"from_secret": "PACKAGE_BUCKET"}}

state_bucket_variable = {"STATE_BUCKET": {"from_secret": "STATE_BUCKET"}}

build_variables = dict(aws_credentials.items() + package_bucket_variable.items())

deploy_variables = dict(
    aws_credentials.items()
    + package_bucket_variable.items()
    + state_bucket_variable.items()
    + cloudflare_credentials.items()
)

set_workspace_variable = "if [ ! -z \"$DRONE_DEPLOY_TO\" ]; then export WORKSPACE=\"$DRONE_DEPLOY_TO\"; else export WORKSPACE=\"$(echo $DRONE_BRANCH | tr '[:upper:]' '[:lower:]' | tr '/' '-' | tr '_' '-')\"; fi"

default_pipeline_config = {
    "kind": "pipeline",
    "type": "docker",
    "image_pull_secrets": ["dockerconfig"],
}

raw_jobs = {
    "report pipeline outcome": {
        "image": images["slack"],
        "settings": {
            "webhook": slack_webhook,
        },
    },
    "audit app node modules": {
        "image": images["nodejs"],
        "commands": [
            "cd app",
            'npm audit --audit-level="high"',
            "npm audit --production",
        ],
    },
    "audit kelly node modules": {
        "image": images["nodejs"],
        "commands": [
            "cd app/kelly",
            'npm audit --audit-level="high"',
            "npm audit --production",
        ],
    },
    "audit kelly integration tests node modules": {
        "image": images["nodejs"],
        "commands": [
            "cd app/kelly/test/integration",
            'npm audit --audit-level="high"',
            "npm audit --production",
        ],
    },
    "install app node modules": {
        "image": images["nodejs"],
        "commands": ["cd app", "npm ci"],
    },
    "lint javascript": {
        "image": images["nodejs"],
        "depends_on": ["install app node modules"],
        "commands": ["cd app", "npm run linter"],
    },
    "validate terraform": {
        "image": images["terraform"],
        "commands": [
            "cd infrastructure",
            "terraform init -backend=false",
            "terraform validate",
        ],
    },
    "check terraform formatting": {
        "image": images["terraform"],
        "commands": [
            "cd infrastructure",
            "terraform fmt -check -recursive",
        ],
    },
    "lint terraform": {
        "image": images["tflint"],
        "commands": ["cd infrastructure", "tflint --init", "tflint"],
    },
    "check drone config formatting": {
        "image": images["python"],
        "commands": ["pip install black", "black --check .drone.star"],
    },
    "spellcheck markdown files": {
        "image": images["nodejs"],
        "commands": [
            "npm i -g markdown-spellcheck",
            "mdspell '**/*.md' '!**/node_modules/**/*.md' -n -x --en-gb -r || echo \"allowing failure\"",  # todo don't allow failure
        ],
    },
    "build app": {
        "image": images["nodejs"],
        "depends_on": ["install app node modules"],
        "commands": ["cd app", "npm run build"],
    },
    "checksum kelly lambda layer": {
        "image": images["aws cli"],
        "environment": build_variables,
        "commands": [
            "cd app/kelly",
            "LAYER_HASH=$(sha1sum package.json package-lock.json build-layer.sh | sha1sum | awk '{ print $1 }')",
            'echo "LAYER_HASH = $LAYER_HASH"',
            'LAYER_ZIP_OBJECT_NAME="$DRONE_REPO_NAME/kelly-layer/$LAYER_HASH.zip"',
            'echo "LAYER_ZIP_OBJECT_NAME = $LAYER_ZIP_OBJECT_NAME"',
            'echo "$LAYER_ZIP_OBJECT_NAME" > .layer-zip-object-name',
            'if ! aws s3api head-object --bucket "$PACKAGE_BUCKET" --key "$LAYER_ZIP_OBJECT_NAME"; then echo "run-build" > .run-build; fi',
        ],
    },
    "build kelly lambda layer": {
        "image": images["amazon linux"],
        "depends_on": ["checksum kelly lambda layer"],
        "commands": [
            "cd app/kelly",
            'echo "' + node_version + '" > .nvmrc',
            'if [ -f ".run-build" ]; then ./build-layer.sh; else echo "Skipping build"; fi',
        ],
    },
    "upload kelly lambda layer": {
        "image": images["aws cli"],
        "environment": build_variables,
        "depends_on": ["build kelly lambda layer"],
        "commands": [
            "cd app/kelly",
            """if [ -f ".run-build" ]; then
              LAYER_ZIP_OBJECT_NAME="$(cat .layer-zip-object-name)"
              aws s3api put-object --bucket "$PACKAGE_BUCKET" --key "$LAYER_ZIP_OBJECT_NAME" --body layer.zip; else echo "Skipping upload"
            fi""",
        ],
    },
    "upload kelly lambda function": {
        "image": images["aws cli"],
        "environment": build_variables,
        "commands": [
            "cd app/kelly",
            'FUNCTION_ZIP_OBJECT_NAME="$DRONE_REPO_NAME/kelly-function/$DRONE_BUILD_NUMBER.zip"',
            "yum install -y zip",
            "cat .zipignore | tr '\r\n' ' ' | xargs zip -r function.zip . -x",
            'aws s3api put-object --bucket "$PACKAGE_BUCKET" --key "$FUNCTION_ZIP_OBJECT_NAME" --body function.zip',
        ],
    },
    "bundle deployment package": {
        "image": images["alpine"],
        "environment": build_variables,
        "depends_on": ["build app", "checksum kelly lambda layer"],
        "commands": [
            "mkdir -p package/app/kelly",
            "cp -r infrastructure package/infrastructure",
            "cp -r app/dynamic package/app/dynamic",
            "cp -r app/build package/app/build",
            "cp -r app/workers package/app/workers",
            "cp app/kelly/.layer-zip-object-name package/app/kelly/.layer-zip-object-name",
            "tar -zcf package.tgz package",
        ],
    },
    "upload deployment package": {
        "image": images["aws cli"],
        "environment": build_variables,
        "depends_on": ["bundle deployment package"],
        "commands": [
            'aws s3api put-object --key "$DRONE_REPO_NAME/$DRONE_BUILD_NUMBER.tgz" --body package.tgz --bucket "$PACKAGE_BUCKET" --tagging="Build=$DRONE_BUILD_NUMBER&Commit=$DRONE_COMMIT_SHA&Repository=$DRONE_REPO_LINK&Service=$DRONE_REPO_NAME"'
        ],
    },
    "get deployment package": {
        "image": images["aws cli"],
        "environment": build_variables,
        "commands": [
            'if [ "$DRONE_BUILD_PARENT" -gt 0 ]; then package_name="$DRONE_BUILD_PARENT"; else package_name="$DRONE_BUILD_NUMBER"; fi',
            'aws s3api get-object --key "$DRONE_REPO_NAME/$package_name.tgz" --bucket "$PACKAGE_BUCKET" package.tgz',
        ],
    },
    "extract deployment package": {
        "image": images["alpine"],
        "depends_on": ["get deployment package"],
        "commands": ["tar -zxf package.tgz"],
    },
    "construct deployment variables": {
        "image": images["alpine"],
        "environment": package_bucket_variable,
        "depends_on": ["extract deployment package"],
        "commands": [
            "apk add --no-cache gettext",
            "export branch_slug=$(echo $DRONE_BRANCH | tr '[:upper:]' '[:lower:]' | tr '/' '-' | tr '_' '-' | tr '.' '-')",
            set_workspace_variable,
            'echo "$WORKSPACE" > workspace.tmp',
            "cd package/infrastructure",
            'export DYNAMIC_APP_DIRECTORY_PATH="$(cd ../app/dynamic && pwd)"',
            'export STATIC_APP_DIRECTORY_PATH="$(cd ../app/build && pwd)"',
            'export CLOUDFLARE_WORKER_SCRIPTS="$(cd ../app/workers && pwd)"',
            'if [ "$DRONE_BUILD_PARENT" -gt 0 ]; then build_number="$DRONE_BUILD_PARENT"; else build_number="$DRONE_BUILD_NUMBER"; fi',
            'export KELLY_FUNCTION_KEY="$DRONE_REPO_NAME/kelly-function/$build_number.zip"',
            'export KELLY_LAYER_KEY="$(cat ../app/kelly/.layer-zip-object-name)"',
            "envsubst < terraform.tfvars.tpl > terraform.tfvars",
        ],
    },
    "terraform init": {
        "image": images["terraform"],
        "environment": deploy_variables,
        "depends_on": ["construct deployment variables"],
        "commands": [
            "export WORKSPACE=$(cat workspace.tmp)",
            "cd package/infrastructure",
            'terraform init -input=false --backend-config="bucket=$STATE_BUCKET"',
            'terraform workspace select "$WORKSPACE" || terraform workspace new "$WORKSPACE"',
        ],
    },
    "terraform plan": {
        "image": images["terraform"],
        "environment": deploy_variables,
        "depends_on": ["terraform init"],
        "commands": [
            "cd package/infrastructure",
            "terraform plan -input=false -out=tfplan",
        ],
    },
    "terraform compliance": {
        "image": images["terraform compliance"],
        "environment": deploy_variables,
        "depends_on": ["terraform plan"],
        "commands": [
            "cd package/infrastructure",
            "terraform-compliance --features ./test/compliance --planfile tfplan",
        ],
    },
    "terraform apply": {
        "image": images["terraform"],
        "environment": deploy_variables,
        "depends_on": ["terraform compliance"],
        "commands": [
            "apk add --no-cache curl",
            "cd package/infrastructure",
            "terraform apply -input=false tfplan",
        ],
    },
    "terraform destroy plan": {
        "image": images["terraform"],
        "environment": deploy_variables,
        "depends_on": ["terraform init"],
        "commands": [
            "cd package/infrastructure",
            "terraform plan -input=false -destroy",
        ],
    },
    "terraform destroy": {
        "image": images["terraform"],
        "environment": deploy_variables,
        "depends_on": ["terraform destroy plan"],
        "commands": [
            "apk add --no-cache curl",
            "cd package/infrastructure",
            "terraform destroy -input=false -auto-approve",
        ],
    },
    "kelly integration tests": {
        "image": images["nodejs"],
        "environment": aws_credentials,
        "commands": [
            "cd app/kelly/test/integration",
            "npm ci",
            set_workspace_variable,
            "npm test",
        ],
    },
}

jobs = {
    job_name: dict({"name": job_name}.items() + job_properties.items())
    for job_name, job_properties in raw_jobs.items()
}

validate = extend_default(
    {
        "name": "validate",
        "trigger": {"event": ["custom", "push"]},
        "steps": [
            jobs["audit app node modules"],
            jobs["audit kelly node modules"],
            jobs["audit kelly integration tests node modules"],
            jobs["install app node modules"],
            jobs["lint javascript"],
            jobs["check drone config formatting"],
            jobs["spellcheck markdown files"],
            jobs["validate terraform"],
            jobs["check terraform formatting"],
            jobs["lint terraform"],
        ],
    }
)

build = extend_default(
    {
        "name": "build",
        "trigger": {"event": ["custom", "push"]},
        "depends_on": ["validate"],
        "steps": [
            jobs["install app node modules"],
            jobs["build app"],
            jobs["checksum kelly lambda layer"],
            jobs["build kelly lambda layer"],
            jobs["upload kelly lambda layer"],
            jobs["upload kelly lambda function"],
            jobs["bundle deployment package"],
            jobs["upload deployment package"],
        ],
    }
)

deploy = extend_default(
    {
        "name": "deploy",
        "trigger": {"event": ["custom", "push", "promote"]},
        "depends_on": ["build"],
        "clone": {"disable": True},
        "steps": [
            jobs["get deployment package"],
            jobs["extract deployment package"],
            jobs["construct deployment variables"],
            jobs["terraform init"],
            jobs["terraform plan"],
            jobs["terraform compliance"],
            jobs["terraform apply"],
        ],
    }
)

test = extend_default(
    {
        "name": "test",
        "trigger": {"event": ["custom", "push"]},
        "depends_on": ["deploy"],
        "steps": [jobs["kelly integration tests"]],
    }
)

destroy = extend_default(
    {
        "name": "destroy",
        "trigger": {
            "event": ["custom", "push", "rollback"],
            "status": ["success", "failure"],
        },
        "depends_on": ["deploy", "test"],
        "clone": {"disable": True},
        "steps": [
            jobs["get deployment package"],
            jobs["extract deployment package"],
            jobs["construct deployment variables"],
            jobs["terraform init"],
            jobs["terraform destroy plan"],
            jobs["terraform destroy"],
        ],
    }
)

report = extend_default(
    {
        "name": "report",
        "depends_on": ["validate", "build", "deploy", "destroy"],
        "clone": {"disable": True},
        "trigger": {
            "event": ["custom", "promote", "push", "rollback"],
            "status": ["success", "failure"],
        },
        "steps": [jobs["report pipeline outcome"]],
    }
)
