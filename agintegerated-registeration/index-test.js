process.env.ENVIRONMENT = "local";
//const { handler } = require("./index");
const { handler } = require("./dist/index");
const mockSQSEvent = require("./mock-events/ApiGateway-event.json");

handler(mockSQSEvent);
