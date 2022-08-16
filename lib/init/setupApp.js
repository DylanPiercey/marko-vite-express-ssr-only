import expressWinston from "express-winston";
import http from "http";
import https from "https";
import markoMiddleware from "@marko/express";
import express from "express";
import logger from "../logger.js";

export default function setupApp() {
  // AWS.config.update({
  //   region: "eu-west-1",
  //   credentials: {
  //     accessKeyId: config.AWS_ACCESS_KEY_ID,
  //     secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  //   },
  // });
  const app = express();
  app.use(markoMiddleware.default()); // Kommer antagligen komma en ny release som löser det här

  // eslint-disable-next-line no-new
  https.globalAgent = new https.Agent({ keepAlive: true, maxSockets: Infinity });
  // eslint-disable-next-line no-new
  http.globalAgent = new http.Agent({ keepAlive: true, maxSockets: Infinity });

  // Make sure dates are displayed in the correct timezone
  process.env.TZ = "Europe/Stockholm";

  // middleware(app);
  // app.use(routes);
  setupErrorLogging(app);
  // app.use(errorHandler);

  return app;
}

function setupErrorLogging(app) {
  // Writes to the file defined in logger.js
  app.use(
    expressWinston.logger({
      winstonInstance: logger,
      statusLevels: { success: "info", warn: "info", error: "error" },
    })
  );
}
