"use strict";

const agintegeratedRregisterationHandler = require("./agintegerated-registeration/agintegerated-registeration-handler");
const FailureError = require("./shared/custom-errors");
const Logger = require("./shared/logger");
const STEP = "Main Handler";
let entry;

exports.handler = async event => {
  try {
    // validate that event is sqs event
    validateEvent(event);

    //Get body from event
    //let messageBody = JSON.parse(event.body);
    entry = event.body;

    // ToDo validate params are not missing
    await agintegeratedRregisterationHandler(JSON.parse(entry));

    const response = {
      statusCode: 200
    };
    return response;
  } catch (exception) {
    /*if (exception instanceof FailureError) {
      await Logger.failure(
        STEP,
        JSON.stringify({ error: exception.message, stack: exception.stack }),
        entry
      );
    }*/
    return { statusCode: 500 };
  }
};

function validateEvent(event) {
  if (!(event.body && event.httpMethod === "POST")) {
    STEP = "Event Validation";
    throw new FailureError("invalid event.");
  }
}
