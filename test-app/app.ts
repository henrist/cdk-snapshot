import * as lambda from "@aws-cdk/aws-lambda"
import * as cdk from "@aws-cdk/core"

const app = new cdk.App()

const stack1 = new cdk.Stack(app, "stack-1", {
  env: {
    account: "112233445566",
    region: "eu-west-1",
  },
})

const fn1 = new lambda.Function(stack1, "MyFunction", {
  code: lambda.Code.fromAsset("test-app/example-asset"),
  handler: "index.handler",
  runtime: lambda.Runtime.NODEJS_12_X,
})

new cdk.CfnOutput(stack1, "MyFunctionVersionOutput", {
  value: fn1.currentVersion.version,
})

const stage = new cdk.Stage(app, "my-stage")

const stack2 = new cdk.Stack(stage, "stack-2", {
  env: {
    account: "112233445566",
    region: "eu-west-1",
  },
})

const fn2 = new lambda.Function(stack2, "MyFunction", {
  code: lambda.Code.fromAsset("test-app/example-asset"),
  handler: "index.handler",
  runtime: lambda.Runtime.NODEJS_12_X,
})

new cdk.CfnOutput(stack2, "MyFunctionVersionOutput", {
  value: fn2.currentVersion.version,
})
