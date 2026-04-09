import * as path from "path";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as amplify from "aws-cdk-lib/aws-amplify";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";

export class CalcAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const githubOwner = new cdk.CfnParameter(this, "GitHubOwner", {
      type: "String",
      default: "dookie07",
      description: "GitHub username/org that owns the repository.",
    });

    const githubRepo = new cdk.CfnParameter(this, "GitHubRepo", {
      type: "String",
      default: "calc-app",
      description: "GitHub repository name.",
    });

    const githubBranch = new cdk.CfnParameter(this, "GitHubBranch", {
      type: "String",
      default: "master",
      description: "GitHub branch Amplify should deploy from.",
    });

    const githubTokenSecretName = new cdk.CfnParameter(this, "GitHubTokenSecretName", {
      type: "String",
      description:
        "Name of Secrets Manager secret containing a GitHub personal access token.",
    });

    const calculateFunction = new lambda.Function(this, "CalculateFunction", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "..", "..", "apps", "api")),
      timeout: cdk.Duration.seconds(10),
    });

    const api = new apigateway.RestApi(this, "CalculatorApi", {
      restApiName: "calculator-api",
      deployOptions: {
        stageName: "prod",
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: ["POST", "OPTIONS"],
        allowHeaders: ["Content-Type"],
      },
    });

    const calculateResource = api.root.addResource("calculate");
    calculateResource.addMethod("POST", new apigateway.LambdaIntegration(calculateFunction));

    const amplifyApp = new amplify.CfnApp(this, "CalculatorAmplifyApp", {
      name: "calc-app",
      repository: cdk.Fn.join("", [
        "https://github.com/",
        githubOwner.valueAsString,
        "/",
        githubRepo.valueAsString,
      ]),
      accessToken: cdk.SecretValue.secretsManager(githubTokenSecretName.valueAsString).toString(),
      buildSpec: [
        "version: 1",
        "applications:",
        "  - appRoot: apps/web",
        "    frontend:",
        "      phases:",
        "        preBuild:",
        "          commands:",
        "            - cd ../..",
        "            - npm ci",
        "        build:",
        "          commands:",
        "            - npm run build -w @calc-app/web",
        "      artifacts:",
        "        baseDirectory: apps/web/dist",
        "        files:",
        "          - '**/*'",
        "      cache:",
        "        paths:",
        "          - node_modules/**/*",
      ].join("\n"),
      environmentVariables: [
        {
          name: "AMPLIFY_MONOREPO_APP_ROOT",
          value: "apps/web",
        },
      ],
      platform: "WEB",
    });

    const branch = new amplify.CfnBranch(this, "CalculatorAmplifyBranch", {
      appId: amplifyApp.attrAppId,
      branchName: githubBranch.valueAsString,
      enableAutoBuild: true,
      framework: "React",
      stage: "PRODUCTION",
      environmentVariables: [
        {
          name: "VITE_API_URL",
          value: api.url.replace(/\/$/, ""),
        },
      ],
    });
    branch.addDependency(amplifyApp);

    new cdk.CfnOutput(this, "ApiBaseUrl", {
      value: api.url.replace(/\/$/, ""),
      description: "Base URL to use for VITE_API_URL.",
    });

    new cdk.CfnOutput(this, "AmplifyAppId", {
      value: amplifyApp.attrAppId,
      description: "Amplify App ID.",
    });
  }
}
