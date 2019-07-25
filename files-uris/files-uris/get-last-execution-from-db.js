const couchbase = require("../services/couchbase/couchbase-utils");
const config = require("../shared/configuration/configure");
//const config = require("../shared/Config/config");
const Logger = require("../shared/logger");

const couchbaseConfig = config.couchbaseConfig;
//const couchBaseRetrypolicy = config.policies.defaultCouchBaseRetyPolicy;
const STEP = "Get Last Execution From CouchBase";

async function getLastExecutionFromDB(params) {
  try {
    const bucketName = `\`${couchbaseConfig.bucketName}\``;
    const query = `select LastExecution from ${bucketName} where meta().id like "checkpoint::${
      params.dataSource
    }"`;

    //let key = `checkpoint::${params.dataSource}`;
    console.log("Start getLastExecutionFromDB/executeQueryWithRetry");
    /*let row = await couchbase.executeQueryWithRetry({
      queryType: couchbase.queryTypes.Get,
      key
    });*/
    let row = await couchbase.executeQueryWithRetry({
      queryType: couchbase.queryTypes.Query,
      query
    });
    console.log(
      `End getLastExecutionFromDB/executeQueryWithRetry ${row.LastExecution}`
    );
    if (row[0]) {
      return row[0].LastExecution;
    } else {
      return undefined;
    }
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
