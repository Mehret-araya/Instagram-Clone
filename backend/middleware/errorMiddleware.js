
const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  // If the response has already started, let Express handle the error.
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || err.status || 500;
  let message = "Internal Server Error";

  // MongoDB duplicate-key error (for example, duplicate username/email)
  if (err.code === 11000) {
    statusCode = 409;
    message = "A user with that username or email already exists";
  }
  // Mongoose validation error
  else if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Invalid input data";
  }
  // Invalid MongoDB ObjectId
  else if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource identifier";
  }
  // Malformed JSON request body
  else if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Invalid JSON request body";
  }
  // Known client errors
  else if (statusCode >= 400 && statusCode < 500) {
    message = err.message || "Request could not be processed";
  }
  // Show detailed messages only during development
  else if (process.env.NODE_ENV !== "production") {
    message = err.message || "Internal Server Error";
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

export default errorMiddleware;
