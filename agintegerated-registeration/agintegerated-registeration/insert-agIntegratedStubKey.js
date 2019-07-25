const couchbase = require("../services/couchbase/couchbase-utils");
const config = require("../shared/configuration/configure");
const Logger = require("../shared/logger");

const STEP = "Insert AgIntegrated StubKey";
const couchbaseConfig = config.couchbaseConfig;
const couchBaseRetrypolicy = config.policies.defaultCouchBaseRetyPolicy;

async function insertAgIntegratedStubKey(params) {
  try {
    const bucketName = `\`${couchbaseConfig.bucketName}\``;
    /* let query = `UPSERT INTO ${bucketName} (KEY, VALUE)
  VALUES ("agintegrated::${params.dataSource}", { "agIntegratedStubKey" : "${
      params.agIntegratedStubKey
    }", "dataSource" : "${params.dataSource}" })`;*/

    let key = `agintegratedkey::${params.dataSource}`;
    let value = `{ "agIntegratedStubKey" : "${
      params.agIntegratedStubKey
    }", "dataSource" : "${params.dataSource}" }`;

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

module.exports = insertAgIntegratedStubKey;
