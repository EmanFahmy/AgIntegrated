const insertAgIntegratedStubKey = require("./insert-agIntegratedStubKey");
const validateParams = require("./validate-params");
const couchbaseUtility = require("../services/couchbase/couchbase-utils");

async function handler(params) {
  await validateParams(params);

  //Configure Couch base
  await couchbaseUtility.configureCouchbase();

  //insert agIntegratedStubKey to couchbase
  console.log("Start insertAgIntegratedStubKey ");
  await insertAgIntegratedStubKey(params);
  console.log("End insertAgIntegratedStubKey ");

  //close Couch base
  await couchbaseUtility.closeCouchbase();
}

module.exports = handler;
