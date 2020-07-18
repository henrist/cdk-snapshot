import * as lambda from "@aws-cdk/aws-lambda"
import * as cdk from "@aws-cdk/core"

const app = new cdk.App()

const stack1 = new cdk.Stack(app, "stack-1", {
  env: {
    account: "112233445566",
    region: "eu-west-1",
  },
})

new lambda.Function(stack1, "MyFunction", {
  code: lambda.Code.fromAsset("test-app/example-asset"),
  handler: "index.handler",
  runtime: lambda.Runtime.NODEJS_12_X,
})
