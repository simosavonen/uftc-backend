const logger = require("./logger");

const requestLogger = (request, response, next) => {
  logger.info("Method: ", request.method, " Path: ", request.path);
  logger.info("Authorization: ", request.headers.authorization);
  logger.info("Body:  ", request.body);
  logger.info("---");
  next();
};

const errorHandler = (error, request, response, next) => {
  if (error.name === "CastError" && error.kind === "ObjectId") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  } else if (error.name === "JsonWebTokenError") {
    return response.status(401).json({ error: "invalid token" });
  }

  logger.error(error.message);

  next(error);
};

module.exports = {
  requestLogger,
  errorHandler
};
