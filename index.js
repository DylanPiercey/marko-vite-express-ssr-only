import express from "express";
import fs from "fs";
import markoMiddleware from "@marko/express";
import vite from "vite";

const isProd = process.env.NODE_ENV === "production";
const port = process.env.PORT || 3000;

const dist = fs.readdirSync("./dist");

(async () => {
  const app = express().use(markoMiddleware.default()); // Kommer antagligen komma en ny release som löser det här

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
      (await devServer.ssrLoadModule("./src/index")).default(req, res, (err) => {
        if (err) {
          devServer.ssrFixStacktrace(err);
          next(err);
        } else {
          next();
        }
      })
    );
  }

  app.listen(port, (err) => {
    if (err) {
      throw err;
    }

    console.log(`Listening on port ${port}`);
  });
})();
