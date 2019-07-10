"use strict";

const couchbase = require("couchbase");
//const sleep = require("sleep");
//const couchbaseConfig = require("../../shared/configuration").couchbaseConfig;
//const { policies } = require("../../shared/configuration");

const couchbaseConfig = require("../../shared/configuration/configure")
  .couchbaseConfig;
const policies = require("../../shared/configuration/configure").policies;

const queryTypes = {
  Get: "Get",
  Upsert: "Upsert",
  Query: "Query",
  Remove: "Remove"
};

let N1qlQuery = couchbase.N1qlQuery;
let cluster;
let bucket;

async function configureCouchbase() {
  cluster = new couchbase.Cluster(couchbaseConfig.URL);
  await cluster.authenticate(
    couchbaseConfig.clusterUserName,
    couchbaseConfig.clusterPassword
  );
  bucket = await cluster.openBucket(couchbaseConfig.bucketName, "");

  bucket.on("error", error => {
    console.log(error);
  });
}

async function closeCouchbase() {
  await bucket.disconnect();
  console.log(`End executeQuery/bucket.disconnect`);
}

async function executeQuery(queryAsString) {
  let query = N1qlQuery.fromString(queryAsString);

  return new Promise((resolve, reject) => {
    console.log(`Start executeQuery/query ${queryAsString}`);
    bucket.query(query, function(err, result) {
      console.log(`In Progress executeQuery/query`);

      if (err) reject(err);
      console.log(`End executeQuery/query ${queryAsString}`);
      resolve(result);
    });
  });
}

async function executeQueryWithRetry(
  { queryType, query, key, value },
  retry_policy = policies.defaultCouchBaseRetyPolicy
) {
  let timeout = retry_policy.timeout;
  let retries_number = retry_policy.retry;
  let interval = retry_policy.interval;

  let non_retryable_error = [];
  let finalResult;
  bucket.operationTimeout = timeout;

  for (let i = 0; i < retries_number; i++) {
    if (i > 0) {
      //await sleep.sleep(interval / 1000);
    }
    try {
      switch (queryType) {
        case "Query":
          console.log(`Start couchbase run query ${query}`);
          finalResult = await executeQuery(query);
          console.log(`End couchbase run query ${query}`);
          break;
        case "Get":
          console.log(`Start couchbase get document key: ${key}`);
          finalResult = JSON.parse((await get(key)).value);
          console.log(`End couchbase get document ${key}`);
          break;
        case "Upsert":
          console.log(
            `Start couchbase upsert document key: ${key} value: ${value}`
          );
          finalResult = await upsert(key, value);
          console.log(`End couchbase upsert document key: ${key}`);
          break;
        case "Remove":
          console.log(`Start couchbase Remove document key: ${key}`);
          finalResult = await remove(key);
          console.log(`Start couchbase Remove document key: ${key}`);
          break;
      }

      if (finalResult) return finalResult;
    } catch (error) {
      console.log(
        `error: Exception Happened in retry number ${i +
          1} while try to execute query ${query}`,
        `Error: ${error.message}`
      );

      if (error.message in non_retryable_error) return result;

      //Throw exception for last error
      if (i === retries_number - 1) {
        throw error;
      }
    }
  }
}

async function get(key) {
  return new Promise(async (resolve, reject) => {
    await bucket.get(key, function(err, result) {
      if (err) reject(err);
      resolve(result);
    });
  });
}

async function upsert(key, value) {
  return new Promise(async (resolve, reject) => {
    await bucket.upsert(key, value, function(err, result) {
      if (err) reject(err);
      resolve(result);
    });
  });
}

async function remove(key) {
  return new Promise(async (resolve, reject) => {
    await bucket.remove(key, function(err, result) {
      if (err) reject(err);
      resolve(result);
    });
  });
}

module.exports = {
  executeQueryWithRetry,
  configureCouchbase,
  closeCouchbase,
  queryTypes
};
