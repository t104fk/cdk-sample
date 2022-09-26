import { Context, APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";
import { sleep } from "./utils/timer";
import * as AWS from "aws-sdk";
const SQS = new AWS.SQS({ region: "ap-northeast-1" });
const QueueUrl = process.env.QUEUE_URL!;

const DURATION = 1000;
export const producerHandler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}`);

  try {
    const sendMessage = await SQS.sendMessage({
      MessageBody: JSON.stringify(event.body),
      QueueUrl,
    }).promise();
    return {
      statusCode: 201,
      body: JSON.stringify(sendMessage),
    };
  } catch (e) {
    console.error("Failed to enqueue", e);
    return { statusCode: 500, body: JSON.stringify({ message: e }) };
  }
};

export const consumerHandler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}`);
  // TODO: parameterize
  console.log(`Start sleep`);
  await sleep(DURATION);
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `You've slept ${DURATION}ms`,
    }),
  };
};
