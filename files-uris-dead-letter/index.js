"use strict";

const FailureError = require("./shared/custom-errors");
const Logger = require("./shared/logger");
let STEP = "";

exports.handler = async event => {
  let funcParams;
  try {
    // validate that event is sqs event
    STEP = "Event Validation";
    validateEvent(event);

    //Get user stub key from SQS
    //let messageBody = JSON.parse(event.Records[0].body);
    let messageBody = event.Records[0].body;
    let agIntegratedStubKey = messageBody.agIntegratedStubKey;
    let landdbUserEmail = messageBody.landdbUserEmail;
    let jobId = messageBody.jobId;
    let startDateTime = messageBody.startDateTime;

    funcParams = { landdbUserEmail, agIntegratedStubKey, jobId, startDateTime };

    // validate params are not missing

    STEP = "Validate Parameters";
    await validateParams(funcParams);

    STEP = "Step 2 get file uri fall in dead letter";
    throw new FailureError("get file uri fall in dead letter queue");
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

async function validateParams(params) {
  if (
    !(
      params.landdbUserEmail &&
      params.agIntegratedStubKey &&
      params.jobId &&
      params.startDateTime
    )
  ) {
    let errormessage =
      "missing one or more of event paramaters (landdbUserEmail, agIntegratedStubKey, jobId, startDateTime)";

    await Logger.failure(STEP, errormessage, params);

    throw new FailureError(errormessage);
  }
}
