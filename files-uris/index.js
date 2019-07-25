"use strict";

const filesURIs = require("./files-uris/files-uris-handler");
const FailureError = require("./shared/custom-errors");
const Logger = require("./shared/logger");
const STEP = "Event Validation";

exports.handler = async event => {
  let funcParams;
  try {
    // validate that event is sqs event
    validateEvent(event);

    //Get user stub key from SQS
    //let messageBody = JSON.parse(event.Records[0].body);
    let messageBody = event.Records[0].body;
    let agIntegratedStubKey = messageBody.agIntegratedStubKey;
    let dataSource = messageBody.dataSource;
    let jobId = messageBody.jobId;
    let startDateTime = messageBody.startDateTime;

    funcParams = { dataSource, agIntegratedStubKey, jobId, startDateTime };

    // ToDo validate params are not missing

    await filesURIs(funcParams);
  } catch (exception) {
    if (exception instanceof FailureError) {
      await Logger.failure(
        STEP,
        JSON.stringify({ error: exception.message, stack: exception.stack }),
        funcParams
      );
    } else {
      Logger.error(
        STEP,
        JSON.stringify({ error: exception.message, stack: exception.stack }),
        funcParams
      );
      throw exception;
    }
  }
};

function validateEvent(event) {
  if (
    !(
      event.Records &&
      event.Records[0] &&
      event.Records[0].eventSource === "aws:sqs"
    )
  ) {
    throw new FailureError("invalid event.");
  }
}
