const logger = require("./logger");

const requestLogger = (request, response, next) => {
  logger.info("Method: ", request.method, " Path: ", request.path);
  // no need to log 'Authhorization: undefined'
  if (request.headers.authorization) {
    logger.info("Authorization: ", request.headers.authorization);
  }
  // don't log body if it's just an empty object {}
  if (Object.keys(request.body).length !== 0) {
    logger.info("Body:  ", request.body);
  }
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
  } else {
    // Unhandled error!
    response.status(400).json({ error: error.message });
  }

  logger.error(error.message);

  next(error);
};

module.exports = {
  requestLogger,
  errorHandler
};
