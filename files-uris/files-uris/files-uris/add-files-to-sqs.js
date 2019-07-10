//const config = require("../shared/configuration");
const config = require("../shared/configuration/configure");
const sqsUtilities = require("../services/sqs/add-to-sqs-with-retry");
const Logger = require("../shared/logger");

const fileURIsQueue = config.sqsConfig.fileURIsQueue;
const SQSRetyPolicy = config.policies.defaultSQSRetyPolicy;
const STEP = "Add Files To SQS";

async function addFilestoSQS(listOfFiles, params) {
  try {
    if (listOfFiles) {
      listOfFiles = listOfFiles.map(function(entry) {
        return {
          ...params,
          fileId: entry.id,
          nodeId: entry.nodeId,
          hashKey: entry.hash,
          fileName: entry.name
        };
      });
    }
    let queueurl = fileURIsQueue;
    await sqsUtilities.add_to_SQS_with_retry(
      { messages: listOfFiles, queueName: queueurl },
      SQSRetyPolicy
    );
  } catch (exception) {
    Logger.error(
      STEP,
      JSON.stringify({ error: exception.message, stack: exception.stack }),
      params
    );
    throw exception;
  }
}

module.exports = addFilestoSQS;
