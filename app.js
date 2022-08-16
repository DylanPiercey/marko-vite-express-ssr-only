import config from "exp-config";
import express from "express";
// import expressWinston from "express-winston";
import fs from "fs";
// import http from "http";
// import https from "https";
// import markoMiddleware from "@marko/express";
import vite from "vite";

import logger from "../marko-vite-express-ssr-only2/lib/logger.js";
import setupApp from "../marko-vite-express-ssr-only2/lib/init/setupApp.js";

const isProd = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT) || 3000;

const packageInfo = JSON.parse(fs.readFileSync("./package.json", "utf-8"));
const dist = fs.readdirSync("./dist");

// console.log("setupApp",isProd)

(async () => {
  const app = setupApp();

  if (isProd) {
    app
      .use("/assets", express.static("dist/assets")) // Serve assets generated from vite.
      .use(dist);
  } else {
    const devServer = await vite.createServer({
      server: { middlewareMode: true },
    });
    app.use(devServer.middlewares);
    app.use(async (req, res, next) =>
      (await devServer.ssrLoadModule("./lib/index")).default(req, res, (err) => {
        if (err) {
          devServer.ssrFixStacktrace(err);
          next(err);
        } else {
          next();
        }
      })
    );
  }

  const server = app.listen(port, (err) => {
    if (err) {
      throw err;
    }

    logger.info(
      `%s ${config.REVISION ? `(revision=${config.REVISION}) ` : ""}listening on port %d`,
      packageInfo.name,
      server.address().port
    );
  });

  const exitRouter = (options, exitCode) => {
    // eslint-disable-next-line no-console
    if (exitCode || exitCode === 0) console.log(`${exitCode === "SIGINT" ? "\n" : ""}Exit: ${exitCode}`);
    if (options.exit) process.exit(1); // eslint-disable-line no-process-exit
  };

  const exitHandler = (exitCode) => {
    server.close(exitCode);
  };

  const others = ["SIGINT", "SIGUSR1", "SIGUSR2", "SIGHUP", "uncaughtException", "SIGTERM"];
  others.forEach((eventType) => {
    process.on(eventType, exitRouter.bind(null, { exit: true }));
  });

  process.on("exit", exitHandler);
})();
