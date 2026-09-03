import { ApiError } from "../utils/ApiError.js";

export const errorHandlingMiddleware = (err, req, res, next) => {
  // Default error values
  let statusCode = 500;
  let message = "Internal Server Error";
  let errors = [];

  // If the error is an instance of our custom ApiError,
  // use its properties.
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  }
  // For generic errors, we log them for debugging
  // but send a generic message to the client.
  console.error(err.stack); // Important for debugging!

const response = {
    success: false,
    message,
    ...(errors.length > 0 && { errors: errors }),
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  };


  return res.status(statusCode).json(response);
};
