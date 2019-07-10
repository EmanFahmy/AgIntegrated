const apiUtilities = require("./shared/utilities");
const callAPIWithRetry = require("./shared/call-api-with-retry");
const {
  policies,
  agIntegratedConfig
} = require("../../shared/configuration/configure");

async function ListAvailableTelematics(userKey) {
  let url = `${agIntegratedConfig.baseurl}/api/TelematicsNode/Tree`;
  let method = "GET";
  let result;
  try {
    let header = apiUtilities.generateRequestHeaders(method, url, userKey);

    result = await callAPIWithRetry(
      { url: url, method: method, header: header },
      policies.defaultAgIntegratedRetryPolicy
    );
    //console.log(result.elapsedTime);
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
  return result.data;
}

async function ListAvailableFilesFromTelematicNode(
  nodeID,
  created_before_date,
  created_after_date,
  userKey
) {
  let date_created_before_date = new Date(created_before_date);
  let date_created_after_date = new Date(created_after_date);
  if (date_created_before_date > date_created_after_date) {
    date_created_before_date.setDate(date_created_before_date.getDate() - 1); //subtract one day
  } else if (date_created_before_date < date_created_after_date) {
    throw new Error("Error: created_before_date > created_after_date");
  }

  created_before_date = date_created_before_date.toISOString();
  let url = `${
    agIntegratedConfig.baseurl
  }/api/TelematicsNode/${nodeID}/Files?filters[created_after]=${created_after_date}&filters[created_before]=${created_before_date}`;
  let method = "GET";
  let result;
  try {
    let header = apiUtilities.generateRequestHeaders(method, url, userKey);

    result = await callAPIWithRetry(
      { url: url, method: method, header: header },
      policies.defaultAgIntegratedRetryPolicy
    );

    //console.log(result.elapsedTime);
  } catch (error) {
    console.log(error);
    throw error;
  }
  return result.data.data;
}

module.exports = {
  ListAvailableTelematics,
  ListAvailableFilesFromTelematicNode
};
