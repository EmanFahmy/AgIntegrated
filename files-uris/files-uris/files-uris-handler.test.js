process.env.ENVIRONMENT = "local";
const { handler } = require("../index");
const validateParams = require("./validate-params");
const getLastExecution = require("./get-last-execution-from-db");
const getListOfFiles = require("./get-list-of-files");
const getListOfFailedFiles = require("./get-list-of-failed-files");
const updateLastExecution = require("./update-last-exeuction-time");
const addFilestoSQS = require("./add-files-to-sqs");
//const couchbase = require("couchbase").Mock;
//const couchbaseConfig = require("../shared/configuration").couchbaseConfig;
const config = require("../shared/configuration/configure");

const couchbaseUtility = require("../services/couchbase/couchbase-utils");
const sleep = require("sleep");

const couchbaseConfig = config.couchbaseConfig;

describe("validateEvent tests", () => {
  it("should throw exception when non SQS event passed", async () => {
    let event = {
      dataSource: "DataSource-457aa9aa-561f-4ef1-b76f-66348961ebdb",
      AgIntegratedStubKey: "dacfd8b4-f6af-4779-bd99-f1864630515c",
      jobId: 11,
      startDateTime: "2019-06-24T11:45:22.02Z"
    };
    try {
      await handler(event);
    } catch (err) {
      expect(err.message).toEqual("invalid event");
    }
  }, 5000);
});

describe("validateParams tests", () => {
  it("should throw exception when SQS event passed with missing data", async () => {
    let SQSevent = {
      Records: [
        {
          messageId: "19dd0b57-b21e-4ac1-bd88-01bbb068cb78",
          receiptHandle: "MessageReceiptHandle",
          body: {
            dataSource: "DataSource-457aa9aa-561f-4ef1-b76f-66348961ebdb",
            AgIntegratedStubKey: "dacfd8b4-f6af-4779-bd99-f1864630515c",
            startDateTime: "2019-06-24T11:45:22.02Z"
          },
          attributes: {
            ApproximateReceiveCount: "1",
            SentTimestamp: "1523232000000",
            SenderId: "123456789012",
            ApproximateFirstReceiveTimestamp: "1523232000001"
          },
          messageAttributes: {},
          md5OfBody: "7b270e59b47ff90a553787216d55d91d",
          eventSource: "aws:sqs",
          eventSourceARN: "arn:aws:sqs:us-east-1:123456789012:MyQueue",
          awsRegion: "us-east-1"
        }
      ]
    };

    try {
      await validateParams(SQSevent);
    } catch (err) {
      expect(err.message).toEqual(
        "missing one or more of event paramaters (dataSource, agIntegratedStubKey, jobId, startDateTime)"
      );
    }
  }, 5000);
});

describe("GetListOfFiles tests", () => {
  beforeEach(() => {
    params = {
      dataSource: "DataSource-457aa9aa-561f-4ef1-b76f-66348961ebdb",
      agIntegratedStubKey: "dacfd8b4-f6af-4779-bd99-f1864630515c",
      jobId: 11,
      startDateTime: "2019-06-24T11:45:22.02Z"
    };
    lastExecutionTime = "2019-06-24T11:45:22.02Z";
  });
  it("should list Ag integrated files (total count =1) ", async () => {
    let listOfFiles = await getListOfFiles(lastExecutionTime, params);
    expect(listOfFiles.length).toEqual(1);
  }, 100000);
});

describe("GetListOfFailedFiles tests", () => {
  beforeEach(async () => {
    await couchbaseUtility.configureCouchbase();
    const bucketName = `\`${couchbaseConfig.bucketName}\``;
    let query = `UPSERT INTO ${bucketName} (KEY, VALUE)
  VALUES ("FailedFiles::DataSource-457aa9aa-561f-4ef1-b76f-66348961ebdb::NodeId::FileId", {
    "failedCount": 1,
    "hash": "",
    "id": "",
    "nodeId": ""
  })`;
    await couchbaseUtility.executeQueryWithRetry({
      queryType: couchbaseUtility.queryTypes.Query,
      query: query
    });
    await sleep.msleep(5000);

    params = {
      dataSource: "DataSource-457aa9aa-561f-4ef1-b76f-66348961ebdb",
      agIntegratedStubKey: "dacfd8b4-f6af-4779-bd99-f1864630515c",
      jobId: 11,
      startDateTime: "2019-06-24T11:45:22.02Z"
    };
  });

  it("should list failed files in couch base of given user with failure count <3", async () => {
    let listOfFailedFiles = await getListOfFailedFiles(params);
    expect(listOfFailedFiles.length).toEqual(1);
  }, 30000);

  afterEach(async () => {
    const bucketName = `\`${couchbaseConfig.bucketName}\``;
    let query = `delete from ${bucketName} where meta().id = "FailedFiles::DataSource-457aa9aa-561f-4ef1-b76f-66348961ebdb::NodeId::FileId"`;
    await couchbaseUtility.executeQueryWithRetry(query);

    await couchbaseUtility.closeCouchbase();
  });
});

describe("Add files to SQS test", () => {
  beforeEach(async () => {
    params = {
      dataSource: "DataSource-457aa9aa-561f-4ef1-b76f-66348961ebdb",
      agIntegratedStubKey: "dacfd8b4-f6af-4779-bd99-f1864630515c",
      jobId: 11,
      startDateTime: "2019-06-24T11:45:22.02Z"
    };
    const AWS = require("aws-sdk");
    sqs = new AWS.SQS();
    fileURIsQueue = config.sqsConfig.fileURIsQueue;
    await sqs.purgeQueue({ QueueUrl: fileURIsQueue }).promise();
    await sleep.msleep(50000);
  });
  it("should send 2 SQS messages with all details", async () => {
    let listOfFiles = [
      { nodeId: 1, failedCount: 2, hash: "0000" },
      { nodeId: 2, failedCount: 1, hash: "1111" }
    ];
    await addFilestoSQS(listOfFiles, params);
    var sqsParams = {
      QueueUrl: fileURIsQueue,
      AttributeNames: ["ApproximateNumberOfMessages"]
    };
    let res = await sqs.getQueueAttributes(sqsParams).promise();
    expect(res.Attributes.ApproximateNumberOfMessages).toEqual("2");
  }, 100000);
  afterEach(async () => {
    //await sqs.purgeQueue({ QueueUrl: fileURIsQueue }).promise();
  });
});
