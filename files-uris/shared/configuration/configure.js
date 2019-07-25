const local = require("./config.local.json");
const dev = require("./config.dev.json");
const test = require("./config.test.json");

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
