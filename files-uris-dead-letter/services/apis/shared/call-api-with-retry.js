const axios = require("axios");
//const sleep = require("sleep");
//const { policies } = require("../../../shared/configuration");
const policies = require("../../../shared/configuration/configure").policies;

let axiosInstance;

async function call_API_Axios_with_retry(
  { url, method, data, header },
  retry_policy = policies.defaultAgIntegratedRetryPolicy
) {
  let timeout = retry_policy.timeout;
  let retries_number = retry_policy.retry;
  let interval = retry_policy.interval;

  let non_retryable_error = [];

  axiosInstance = axios.create({
    timeout: timeout,
    headers: header
  });

  //const sleep = async t => new Promise((res, rej) => setTimeout(res(), t));

  for (let i = 0; i < retries_number; i++) {
    if (i > 0) {
      //await sleep(interval);
      //await sleep.sleep(interval / 1000);
    }
    try {
      console.log(`Start Call Ag integrated API url: ${url}`);
      result = await call_API_Axios(url, method, data, header);
      console.log(`End Call Ag integrated API url: ${url}`);

      if (result.status === 200) return result;
    } catch (error) {
      console.log(
        `error: Exception Happened in retry number ${i +
          1} while try to call url ${url}`,
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

async function call_API_Axios(url, method, data, header) {
  let res = {};
  switch (method.toUpperCase()) {
    case "GET":
      res = await axiosInstance.get(url, header);
      break;
    case "POST":
      res = await axiosInstance.post(url, data, header);
      break;
    case "PUT":
      res = await axiosInstance.put(url, data, header);
      break;
  }
  return res;
}

module.exports = call_API_Axios_with_retry;
