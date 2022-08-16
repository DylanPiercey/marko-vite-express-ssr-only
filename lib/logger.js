import { dirname, join } from "path";
import config from "exp-config";
import { fileURLToPath } from "url";
import { format as _format, exceptions, createLogger, config as _config, transports as _transports } from "winston";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const filename = join(__dirname, "..", "logs", `${config.envName}.log`);

const enumerateErrorFormat = _format((info) => {
  if (info.meta && info.meta instanceof Error) {
    info.meta = exceptions.getAllInfo(info.meta);
  }

  if (info.message && info.message instanceof Error) {
    info.message = exceptions.getAllInfo(info.message);
  }

  if (info instanceof Error) {
    return exceptions.getAllInfo(info);
  }

  return info;
});

const logger = createLogger({
  levels: _config.syslog.levels,
  level: config.logLevel,
  format: _format.combine(_format.splat(), enumerateErrorFormat()),
  transports: [],
});

if (config.envName === "test") {
  logger.add(
    new _transports.File({
      filename,
      format: _format.combine(
        _format.splat(),
        _format.colorize({ all: true }),
        _format.printf(
          (info) => `${info.level}: ${info.message} ${info.meta && info.meta.stack ? info.meta.stack : ""}`
        )
      ),
      options: { flags: "w" }, // Clear the file between test runs
    })
  );
} else if (config.envName === "development") {
  logger.add(
    new _transports.Console({
      format: _format.combine(
        _format.timestamp(),
        _format.colorize(),
        _format.printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
      ),
    })
  );
} else {
  logger.add(
    new _transports.Console({
      format: _format.combine(_format.timestamp(), _format.json()),
    })
  );
}

export default logger;
