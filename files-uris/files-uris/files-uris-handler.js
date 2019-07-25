const validateParams = require("./validate-params");
const getLastExecution = require("./get-last-execution-from-db");
const getListOfFiles = require("./get-list-of-files");
const getListOfFailedFiles = require("./get-list-of-failed-files");
const updateLastExecution = require("./update-last-exeuction-time");
const addFilestoSQS = require("./add-files-to-sqs");
const couchbaseUtility = require("../services/couchbase/couchbase-utils");

async function handler(params) {
  let listOfAllFiles = [];
  await validateParams(params);

  //Configure Couch base
  await couchbaseUtility.configureCouchbase();

  //Get last Successful execution from couch base
  console.log("Start getLastExecution ");
  let lastExecutionTime = await getLastExecution(params);
  console.log(`End getLastExecution ${lastExecutionTime}`);

  //Get List of Files
  console.log("Start getListOfFiles ");
  let listOfFiles = await getListOfFiles(lastExecutionTime, params);
  console.log(`End getListOfFiles ${listOfFiles}`);
  listOfAllFiles.push(...listOfFiles);

  //Get List of failed files
  console.log("Start getListOfFailedFiles ");
  let listofFailedFiles = await getListOfFailedFiles(params);
  console.log(`End getListOfFailedFiles ${listofFailedFiles}`);
  listOfAllFiles.push(...listofFailedFiles);

  //update last exeuction time
  console.log("Start updateLastExecution ");
  await updateLastExecution(params);
  console.log("End updateLastExecution ");

  // Add files to SQS
  if (listOfAllFiles) {
    console.log(`Start addFilestoSQS ${listOfAllFiles} `);
    await addFilestoSQS(listOfAllFiles, params);
    console.log("End addFilestoSQS ");
  }

  //close Couch base
  await couchbaseUtility.closeCouchbase();
}

module.exports = handler;
