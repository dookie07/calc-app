# CDK IaC

This CDK app provisions:

- Lambda function from `apps/api` (`index.handler`)
- API Gateway REST API with `POST /calculate`
- Amplify app + branch for `apps/web`
- `VITE_API_URL` set to the API Gateway base URL

## Prerequisites

1. AWS CLI configured (`aws configure`)
2. Node.js + npm installed
3. A GitHub personal access token stored in AWS Secrets Manager

Create the GitHub token secret (example):

```bash
aws secretsmanager create-secret --name calc-app-github-token --secret-string "<YOUR_GITHUB_PAT>"
```

## Deploy

From `infra/`:

```bash
npm install
npx cdk bootstrap
npx cdk deploy \
  --parameters GitHubOwner=dookie07 \
  --parameters GitHubRepo=calc-app \
  --parameters GitHubBranch=master \
  --parameters GitHubTokenSecretName=calc-app-github-token
```

Outputs include:

- `ApiBaseUrl`
- `AmplifyAppId`
