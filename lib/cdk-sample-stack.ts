import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { HitCounter } from "./hit-counter";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { LAMBDA_BASE_PATH } from "./helper";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";

export class CdkSampleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const queue = new sqs.Queue(this, "SampleQueue", {
      visibilityTimeout: cdk.Duration.seconds(300),
    });

    // const hello = new HelloWorld(this, "hello-world");
    // const hello = new NodejsFunction(this, "HelloHandler", {
    //   entry: `${LAMBDA_BASE_PATH}/hello.ts`,
    //   handler: "handler",
    // });

    // const helloWithCounter = new HitCounter(this, "HelloHitCounter", {
    //   downstream: hello,
    // });

    const enqueue = new NodejsFunction(this, "EnqueueHandler", {
      entry: `${LAMBDA_BASE_PATH}/queue.ts`,
      handler: "producerHandler",
    });

    enqueue.addEnvironment("QUEUE_URL", queue.queueUrl);
    enqueue.addToRolePolicy(
      new PolicyStatement({
        actions: ["sqs:SendMessage"],
        resources: [queue.queueArn],
      })
    );

    const consumer = new NodejsFunction(this, "ConsumerHandler", {
      entry: `${LAMBDA_BASE_PATH}/queue.ts`,
      handler: "consumerHandler",
    });
    const eventSource = consumer.addEventSource(new SqsEventSource(queue));

    new apigw.LambdaRestApi(this, "Endpoint", {
      handler: enqueue,
    });
  }
}
