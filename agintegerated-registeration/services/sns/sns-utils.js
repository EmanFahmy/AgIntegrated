"use strict";
const AWS = require("aws-sdk");
const sns = new AWS.SNS();
/*{
  apiVersion: "2010-03-31",
  region: "us-east-1"
});*/

async function sendMessageToTopic(topicARN, logMessage) {
  try {
    const params = {
      TargetArn: topicARN,
      Message: logMessage
    };

    return await sns.publish(params).promise();
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  sendMessageToTopic
};
