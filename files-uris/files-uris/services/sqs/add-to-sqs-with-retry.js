//const sleep = require("sleep");
const AWS = require("aws-sdk");
//const { default_SQS_rety_policy } = require("../../shared/configuration");
const default_SQS_rety_policy = require("../../shared/configuration/configure")
  .default_SQS_rety_policy;

//AWS.config.update(AWSConfig);

async function add_one_message_to_SQS_with_retry(
  message,
  messageAttributes = {},
  queueName,
  delay,
  retry_policy
) {
  //TODO: Time out of SQS sending is now depending on the default request timeout
  let timeout = retry_policy.timeout;
  let retries_number = retry_policy.retry;
  let interval = retry_policy.interval;

  let non_retryable_error = [];

  let sqs = new AWS.SQS();

  let params = {
    DelaySeconds: delay,
    MessageAttributes: messageAttributes,
    MessageBody: JSON.stringify(message),
    QueueUrl: queueName
  };

  for (let i = 0; i < retries_number; i++) {
    //if (i > 0) await sleep.sleep(interval / 1000);
    try {
      result = await sqs.sendMessage(params).promise();
      if (result.$response.httpResponse.statusCode === 200) {
        console.log(
          `message id ${result.MessageId} added to queue ${queueName}`
        );
        return result;
      }
    } catch (error) {
      console.log(
        `error: Exception Happened in retry number ${i +
          1} while try to add message to SQS ${queueName}`,
        `Error: ${error.message}`
      );

      if (error.message in non_retryable_error) return result;

      if (i === retries_number - 1) {
        throw error;
      }
    }
  }
}

async function add_to_SQS_with_retry(
  { messages, queueName, attributes },
  retryPolicy = default_SQS_rety_policy
) {
  sqsDelayRecieve = 0;

  if (messages.length === 1) {
    result = await add_one_message_to_SQS_with_retry(
      messages[0],
      attributes,
      queueName,
      sqsDelayRecieve,
      retryPolicy
    );
  } else if (messages.length > 1) {
    sqsDelayRecieve = 0; //900

    messages.forEach(async message => {
      try {
        result = await add_one_message_to_SQS_with_retry(
          message,
          attributes,
          queueName,
          sqsDelayRecieve,
          retryPolicy
        );
      } catch (
        error // All retries of one message failed
      ) {
        // Throw error and exit from foreach
        throw error;
      }
    });
  }
}

module.exports = { add_to_SQS_with_retry };
