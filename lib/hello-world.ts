import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { LAMBDA_BASE_PATH } from "./helper";

export class HelloWorld extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    const helloFunction = new NodejsFunction(this, "HelloHandler", {
      entry: `${LAMBDA_BASE_PATH}/hello.ts`,
      handler: "handler",
    });
    new LambdaRestApi(this, "apigw", {
      handler: helloFunction,
    });
  }
}
