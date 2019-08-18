"use strict";
const AWS=require("aws-sdk");
const sqs=new AWS.SQS({apiVersion: "2012-11-05"});
exports.handler = async (event) => {
try{
    let result = event.body.split("&");
    let jsonObject = {};
    result.forEach(e => {
      jsonObject[e.split("=")[0]] = e.split("=")[1];
    });
    console.log(jsonObject);
    let params = {
      MessageBody: JSON.stringify(jsonObject),
      QueueUrl: process.env.processingQueue,
    };
    await sqs.sendMessage(params).promise();
    return {"statusCode": 200};
  } catch (err) {
    console.log(err);
  }
};
