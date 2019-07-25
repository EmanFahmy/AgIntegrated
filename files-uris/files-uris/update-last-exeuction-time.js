const couchbase = require("../services/couchbase/couchbase-utils");
const config = require("../shared/configuration/configure");
const Logger = require("../shared/logger");

const STEP = "Update Last execution Time";
const couchbaseConfig = config.couchbaseConfig;
const couchBaseRetrypolicy = config.policies.defaultCouchBaseRetyPolicy;

async function updateLastExecutionTime(params) {
  // update last executed in couch base

  try {
    const bucketName = `\`${couchbaseConfig.bucketName}\``;
    /* let query = `UPSERT INTO ${bucketName} (KEY, VALUE)
  VALUES ("Checkpoint::${params.dataSource}", { "AgIntegratedStubKey" : "${
      params.agIntegratedStubKey
    }", "LastExecution" : "${params.startDateTime}" })`;*/

    let key = `checkpoint::${params.dataSource}`;
    let value = `{ "AgIntegratedStubKey" : "${
      params.agIntegratedStubKey
    }", "LastExecution" : "${params.startDateTime}" }`;

    await couchbase.executeQueryWithRetry(
      { queryType: couchbase.queryTypes.Upsert, key, value },
      couchBaseRetrypolicy
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

module.exports = updateLastExecutionTime;
