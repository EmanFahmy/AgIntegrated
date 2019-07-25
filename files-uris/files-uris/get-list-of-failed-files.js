const couchbase = require("../services/couchbase/couchbase-utils");
//const config = require("../shared/configuration");
const config = require("../shared/configuration/configure");
const Logger = require("../shared/logger");

const STEP = "Get List of Failed Files";
const couchbaseConfig = config.couchbaseConfig;
const couchBaseRetrypolicy = config.policies.defaultCouchBaseRetyPolicy;
const failureCount = config.failureCount;

async function getListOfFailedFiles(params) {
  try {
    // get files ids failed with failed count < 3 from couch base
    const bucketName = `\`${couchbaseConfig.bucketName}\``;
    let query = `select id, nodeId, failedCount, \`hash\` , name from ${bucketName} where meta().id like "failedfiles::${
      params.dataSource
    }%" and failedCount < ${failureCount}`;
    let listofFailedFiles = await couchbase.executeQueryWithRetry(
      { queryType: couchbase.queryTypes.Query, query },
      couchBaseRetrypolicy
    );

    return listofFailedFiles;
  } catch (exception) {
    Logger.error(
      STEP,
      JSON.stringify({ error: exception.message, stack: exception.stack }),
      params
    );

    throw exception;
  }
}

module.exports = getListOfFailedFiles;
