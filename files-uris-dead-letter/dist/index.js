(function(e, a) { for(var i in a) e[i] = a[i]; }(exports, /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./index.js":
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const FailureError = __webpack_require__(/*! ./shared/custom-errors */ "./shared/custom-errors.js");
const Logger = __webpack_require__(/*! ./shared/logger */ "./shared/logger.js");
let STEP = "";

exports.handler = async event => {
  let funcParams;
  try {
    // validate that event is sqs event
    STEP = "Event Validation";
    validateEvent(event);

    //Get user stub key from SQS
    //let messageBody = JSON.parse(event.Records[0].body);
    let messageBody = event.Records[0].body;
    let agIntegratedStubKey = messageBody.agIntegratedStubKey;
    let landdbUserEmail = messageBody.landdbUserEmail;
    let jobId = messageBody.jobId;
    let startDateTime = messageBody.startDateTime;

    funcParams = { landdbUserEmail, agIntegratedStubKey, jobId, startDateTime };

    // validate params are not missing

    STEP = "Validate Parameters";
    await validateParams(funcParams);

    STEP = "Step 2 get file uri fall in dead letter";
    throw new FailureError("get file uri fall in dead letter queue");
  } catch (exception) {
    if (exception instanceof FailureError) {
      await Logger.failure(
        STEP,
        JSON.stringify({ error: exception.message, stack: exception.stack }),
        funcParams
      );
    } else {
      Logger.error(
        STEP,
        JSON.stringify({ error: exception.message, stack: exception.stack }),
        funcParams
      );
      throw exception;
    }
  }
};

function validateEvent(event) {
  if (
    !(
      event.Records &&
      event.Records[0] &&
      event.Records[0].eventSource === "aws:sqs"
    )
  ) {
    throw new FailureError("invalid event.");
  }
}

async function validateParams(params) {
  if (
    !(
      params.landdbUserEmail &&
      params.agIntegratedStubKey &&
      params.jobId &&
      params.startDateTime
    )
  ) {
    let errormessage =
      "missing one or more of event paramaters (landdbUserEmail, agIntegratedStubKey, jobId, startDateTime)";

    await Logger.failure(STEP, errormessage, params);

    throw new FailureError(errormessage);
  }
}


/***/ }),

/***/ "./services/cloudwatch-logs/cloudwatchlogs-utils.js":
/*!**********************************************************!*\
  !*** ./services/cloudwatch-logs/cloudwatchlogs-utils.js ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const AWS = __webpack_require__(/*! aws-sdk */ "aws-sdk");
//const cloudwatchConfig = require("../../shared/configuration").cloudwatchConfig;

const cloudwatchConfig = __webpack_require__(/*! ../../shared/configuration/configure */ "./shared/configuration/configure.js")
  .cloudwatchConfig;
//const cloudwatchConfig = config.cloudwatchConfig;
const cloudwatchLogs = new AWS.CloudWatchLogs();
/*{
  apiVersion: "2014-03-28",
  region: "us-east-1"
});*/

async function putLogsToCommonLogGroup(logStreamName, logMessage) {
  try {
    let logstreamData = await describeLogStreamsInCommonLogGroup(logStreamName);

    if (!logstreamData || logstreamData.length === 0) {
      throw new Error(
        `failed to Get logStream Data for ${
          cloudwatchConfig.commonLogGroupName
        } : ${logStreamName} to include next squence parameter in API.`
      );
    }

    let params = {
      logEvents: [
        {
          message: logMessage,
          timestamp: new Date().getTime()
        }
      ],
      logGroupName: cloudwatchConfig.commonLogGroupName,
      logStreamName,
      sequenceToken: logstreamData.logStreams[0].uploadSequenceToken
    };
    await cloudwatchLogs.putLogEvents(params).promise();
  } catch (error) {
    console.log(error);
  }
}

async function describeLogStreamsInCommonLogGroup(logStreamName) {
  try {
    let params = {
      logGroupName: cloudwatchConfig.commonLogGroupName,
      logStreamNamePrefix: logStreamName,
      orderBy: "LogStreamName"
    };
    return await cloudwatchLogs.describeLogStreams(params).promise();
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  putLogsToCommonLogGroup
};


/***/ }),

/***/ "./services/sns/sns-utils.js":
/*!***********************************!*\
  !*** ./services/sns/sns-utils.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const AWS = __webpack_require__(/*! aws-sdk */ "aws-sdk");
const sns = new AWS.SNS();
/*{
  apiVersion: "2010-03-31",
  region: "us-east-1"
});*/

async function sendMessageToTopic(topicARN, logMessage) {
  try {
    const params = {
      TargetArn: topicARN,
      Message: logMessage
    };

    return await sns.publish(params).promise();
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  sendMessageToTopic
};


/***/ }),

/***/ "./shared/configuration/config.dev.json":
/*!**********************************************!*\
  !*** ./shared/configuration/config.dev.json ***!
  \**********************************************/
/*! exports provided: policies, agIntegratedConfig, couchbaseConfig, failureCount, cloudwatchConfig, snsConfig, sqsConfig, default */
/***/ (function(module) {

module.exports = {"policies":{"defaultAgIntegratedRetryPolicy":{"timeout":30000,"retry":2,"interval":5000},"defaultSQSRetyPolicy":{"timeout":5000,"retry":3,"interval":1000},"defaultCouchBaseRetyPolicy":{"timeout":30000,"retry":2,"interval":5000}},"agIntegratedConfig":{"apiKey":"1891d7f9-c6be-407b-b8e5-7dc709c747c4","apiSecret":"84c904e5-3460-49aa-aaac-a6acfbcaa982","baseurl":"https://sandbox.onsiteag.com"},"couchbaseConfig":{"URL":"couchbase://rr-relax.landdb.com","clusterUserName":"eman.fahmy","clusterPassword":"Up453^fhE73u","bucketName":"agintegration-dev"},"failureCount":3,"cloudwatchConfig":{"commonLogGroupName":"AgIntegrationLog","onsiteUsersLogStream":"OnSiteUsers","fileURIsLogStream":"FileURIs","downloaderLogStream":"Downloader"},"snsConfig":{"snsTopicARN":"arn:aws:sns:us-east-1:981913140575:AgIntegratedCommonLog"},"sqsConfig":{"fileURIsQueue":"https://sqs.us-east-1.amazonaws.com/981913140575/files-uris"}};

/***/ }),

/***/ "./shared/configuration/config.local.json":
/*!************************************************!*\
  !*** ./shared/configuration/config.local.json ***!
  \************************************************/
/*! exports provided: policies, agIntegratedConfig, couchbaseConfig, failureCount, cloudwatchConfig, snsConfig, sqsConfig, default */
/***/ (function(module) {

module.exports = {"policies":{"defaultAgIntegratedRetryPolicy":{"timeout":30000,"retry":2,"interval":5000},"defaultSQSRetyPolicy":{"timeout":5000,"retry":3,"interval":1000},"defaultCouchBaseRetyPolicy":{"timeout":30000,"retry":2,"interval":5000}},"agIntegratedConfig":{"apiKey":"1891d7f9-c6be-407b-b8e5-7dc709c747c4","apiSecret":"84c904e5-3460-49aa-aaac-a6acfbcaa982","baseurl":"https://sandbox.onsiteag.com"},"couchbaseConfig":{"URL":"couchbase://localhost","clusterUserName":"eman.fahmy","clusterPassword":"123456","bucketName":"agintegration-dev"},"failureCount":3,"cloudwatchConfig":{"commonLogGroupName":"AgIntegrationLog","onsiteUsersLogStream":"OnSiteUsers","fileURIsLogStream":"FileURIs","downloaderLogStream":"Downloader"},"snsConfig":{"snsTopicARN":"arn:aws:sns:us-east-2:142985572146:AgIntegratedCommonLog"},"sqsConfig":{"fileURIsQueue":"https://sqs.us-east-2.amazonaws.com/142985572146/files-uris"}};

/***/ }),

/***/ "./shared/configuration/config.test.json":
/*!***********************************************!*\
  !*** ./shared/configuration/config.test.json ***!
  \***********************************************/
/*! exports provided: policies, agIntegratedConfig, couchbaseConfig, failureCount, cloudwatchConfig, snsConfig, sqsConfig, default */
/***/ (function(module) {

module.exports = {"policies":{"defaultAgIntegratedRetryPolicy":{"timeout":30000,"retry":2,"interval":5000},"defaultSQSRetyPolicy":{"timeout":5000,"retry":3,"interval":1000},"defaultCouchBaseRetyPolicy":{"timeout":30000,"retry":2,"interval":5000}},"agIntegratedConfig":{"apiKey":"1891d7f9-c6be-407b-b8e5-7dc709c747c4","apiSecret":"84c904e5-3460-49aa-aaac-a6acfbcaa982","baseurl":"https://sandbox.onsiteag.com"},"couchbaseConfig":{"URL":"couchbase://rr-relax.landdb.com","clusterUserName":"eman.fahmy","clusterPassword":"Up453^fhE73u","bucketName":"agintegration-dev"},"failureCount":3,"cloudwatchConfig":{"commonLogGroupName":"AgIntegrationLog","onsiteUsersLogStream":"OnSiteUsers","fileURIsLogStream":"FileURIs","downloaderLogStream":"Downloader"},"snsConfig":{"snsTopicARN":"arn:aws:sns:us-east-1:981913140575:AgIntegratedCommonLog"},"sqsConfig":{"fileURIsQueue":"https://sqs.us-east-1.amazonaws.com/981913140575/files-uris-test"}};

/***/ }),

/***/ "./shared/configuration/configure.js":
/*!*******************************************!*\
  !*** ./shared/configuration/configure.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const local = __webpack_require__(/*! ./config.local.json */ "./shared/configuration/config.local.json");
const dev = __webpack_require__(/*! ./config.dev.json */ "./shared/configuration/config.dev.json");
const test = __webpack_require__(/*! ./config.test.json */ "./shared/configuration/config.test.json");

if (process.env.ENVIRONMENT === "local") {
  module.exports = local;
} else if (process.env.ENVIRONMENT === "dev") {
  module.exports = dev;
} else if (process.env.ENVIRONMENT === "test") {
  module.exports = test;
}

// function config() {
//   let configuration = {};
//   if (process.env.ENVIRONMENT === "local") {
//     configuration = local;
//   } else if (process.env.ENVIRONMENT === "dev") {
//     configuration = dev;
//   } else if (process.env.ENVIRONMENT === "test") {
//     configuration = test;
//   }
//   return configuration;
// }
// module.exports = config;


/***/ }),

/***/ "./shared/constants.js":
/*!*****************************!*\
  !*** ./shared/constants.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = {
  LOG_TYPES: {
    FAILURE: "Failure",
    ERROR: "Error",
    INFO: "Info"
  },
  LAMBDA_FUNCTION_NAME: "Get Files URIs Dead Letter"
};


/***/ }),

/***/ "./shared/custom-errors.js":
/*!*********************************!*\
  !*** ./shared/custom-errors.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports) {

function extend(child, parent) {
  child.prototype = Object.create(parent.prototype);
  child.prototype.constructor = child;
}

function FailureError(message) {
  this.name = "FailureError";
  this.message = message;
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, FailureError);
  }
}
extend(FailureError, Error);

module.exports = FailureError;


/***/ }),

/***/ "./shared/logger.js":
/*!**************************!*\
  !*** ./shared/logger.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const LAMBDA_FUNCTION_NAME = __webpack_require__(/*! ./constants */ "./shared/constants.js").LAMBDA_FUNCTION_NAME;
const LOG_TYPES = __webpack_require__(/*! ./constants */ "./shared/constants.js").LOG_TYPES;

const cloudwatchLogs = __webpack_require__(/*! ../services/cloudwatch-logs/cloudwatchlogs-utils */ "./services/cloudwatch-logs/cloudwatchlogs-utils.js");
const sns = __webpack_require__(/*! ../services/sns/sns-utils */ "./services/sns/sns-utils.js");

//const snsTopicARN = require("./configuration").snsConfig.snsTopicARN;
//const fileURIsLogStream = require("./configuration").cloudwatchConfig
//  .fileURIsLogStream;

const snsTopicARN = __webpack_require__(/*! ./configuration/configure */ "./shared/configuration/configure.js").snsConfig.snsTopicARN;
const fileURIsLogStream = __webpack_require__(/*! ./configuration/configure */ "./shared/configuration/configure.js").cloudwatchConfig
  .fileURIsLogStream;

async function failure(subject, message, params) {
  let logMessage = constructMessage(
    LOG_TYPES.FAILURE,
    subject,
    message,
    params
  );
  await cloudwatchLogs.putLogsToCommonLogGroup(fileURIsLogStream, logMessage);
  await sns.sendMessageToTopic(snsTopicARN, logMessage);
  console.error(logMessage);
}

function error(subject, message, params) {
  let logMessage = constructMessage(LOG_TYPES.ERROR, subject, message, params);
  console.error(logMessage);
}

function info(subject, message, params) {
  let logMessage = constructMessage(LOG_TYPES.INFO, subject, message, params);
  console.info(logMessage);
}

function constructMessage(type, subject, message, params = {}) {
  let subjectText =
    !subject || subject.trim().length < 1
      ? LAMBDA_FUNCTION_NAME
      : LAMBDA_FUNCTION_NAME + " - " + subject;

  let logMessage = {
    type,
    subject: subjectText,
    message,
    ...params
  };
  return JSON.stringify(logMessage);
}

module.exports = {
  failure,
  error,
  info
};


/***/ }),

/***/ 0:
/*!************************!*\
  !*** multi ./index.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! ./index.js */"./index.js");


/***/ }),

/***/ "aws-sdk":
/*!**************************!*\
  !*** external "aws-sdk" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("aws-sdk");

/***/ })

/******/ })));
//# sourceMappingURL=index.js.map