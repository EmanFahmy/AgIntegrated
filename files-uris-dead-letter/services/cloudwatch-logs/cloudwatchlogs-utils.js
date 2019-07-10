"use strict";
const AWS = require("aws-sdk");
//const cloudwatchConfig = require("../../shared/configuration").cloudwatchConfig;

const cloudwatchConfig = require("../../shared/configuration/configure")
  .cloudwatchConfig;
//const cloudwatchConfig = config.cloudwatchConfig;
const cloudwatchLogs = new AWS.CloudWatchLogs();
/*{
  apiVersion: "2014-03-28",
  region: "us-east-1"
});*/

async function putLogsToCommonLogGroup(logStreamName, logMessage) {
  try {
    let logstreamData = await describeLogStreamsInCommonLogGroup(logStreamName);

    if (!logstreamData || logstreamData.length === 0) {
      throw new Error(
        `failed to Get logStream Data for ${
          cloudwatchConfig.commonLogGroupName
        } : ${logStreamName} to include next squence parameter in API.`
      );
    }

    let params = {
      logEvents: [
        {
          message: logMessage,
          timestamp: new Date().getTime()
        }
      ],
      logGroupName: cloudwatchConfig.commonLogGroupName,
      logStreamName,
      sequenceToken: logstreamData.logStreams[0].uploadSequenceToken
    };
    await cloudwatchLogs.putLogEvents(params).promise();
  } catch (error) {
    console.log(error);
  }
}

async function describeLogStreamsInCommonLogGroup(logStreamName) {
  try {
    let params = {
      logGroupName: cloudwatchConfig.commonLogGroupName,
      logStreamNamePrefix: logStreamName,
      orderBy: "LogStreamName"
    };
    return await cloudwatchLogs.describeLogStreams(params).promise();
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  putLogsToCommonLogGroup
};
