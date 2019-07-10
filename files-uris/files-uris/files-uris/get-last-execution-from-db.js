const couchbase = require("../services/couchbase/couchbase-utils");
//const config = require("../shared/configuration");
//const config = require("../shared/Config/config")();
const Logger = require("../shared/logger");

//const couchbaseConfig = config.couchbaseConfig;
//const couchBaseRetrypolicy = config.policies.defaultCouchBaseRetyPolicy;
const STEP = "Get Last Execution From CouchBase";

async function getLastExecutionFromDB(params) {
  try {
    //const bucketName = `\`${couchbaseConfig.bucketName}\``;
    /*const query = `select LastExecution from ${bucketName} where meta().id like "Checkpoint::${
      params.landdbUserEmail
    }"`;*/

    let key = `Checkpoint::${params.landdbUserEmail}`;
    console.log("Start getLastExecutionFromDB/executeQueryWithRetry");
    let row = await couchbase.executeQueryWithRetry({
      queryType: couchbase.queryTypes.Get,
      key
    });
    console.log(
      `End getLastExecutionFromDB/executeQueryWithRetry ${row.LastExecution}`
    );
    return row.LastExecution;
  } catch (exception) {
    console.log(`Error getLastExecutionFromDB ${exception}`);

    Logger.error(
      STEP,
      JSON.stringify({ error: exception.message, stack: exception.stack }),
      params
    );
    throw exception;
  }
}

module.exports = getLastExecutionFromDB;
