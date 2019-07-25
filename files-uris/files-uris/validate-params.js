const FailureError = require("../shared/custom-errors");
const Logger = require("../shared/logger");
const STEP = "Validate Parameters";

async function validateParams(params) {
  if (
    !(
      params.dataSource &&
      params.agIntegratedStubKey &&
      params.jobId &&
      params.startDateTime
    )
  ) {
    let errormessage =
      "missing one or more of event paramaters (dataSource, agIntegratedStubKey, jobId, startDateTime)";

    await Logger.failure(STEP, errormessage, params);

    throw new FailureError(errormessage);
  }
}

module.exports = validateParams;
