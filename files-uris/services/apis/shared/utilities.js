const crypto = require("crypto");
//const agIntegratedConfig = require("../../../shared/configuration")
//.agIntegratedConfig;

const agIntegratedConfig = require("../../../shared/configuration/configure")
  .agIntegratedConfig;

function generateRequestHeaders(method, url, user_key) {
  let unix_time = Math.floor(new Date().getTime() / 1000);
  let path = url
    .toString()
    .split("api/")[1]
    .split("?")[0];
  let signed_parts = [
    method.toUpperCase(),
    path.toLowerCase(),
    unix_time.toString(),
    agIntegratedConfig.apiKey.toLowerCase(),
    user_key.toLowerCase()
  ].join("\r\n");

  let signature = crypto
    .createHmac("sha1", agIntegratedConfig.apiSecret)
    .update(signed_parts)
    .digest()
    .toString("base64");

  return {
    ["X-OS-APIKey"]: agIntegratedConfig.apiKey.toLowerCase(),
    ["X-OS-UserKey"]: user_key,
    ["X-OS-TimeStamp"]: unix_time,
    ["X-OS-Hash"]: signature,
    ["Accept"]: "application/json"
  };
}

module.exports = { generateRequestHeaders };
