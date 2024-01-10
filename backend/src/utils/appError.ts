class AppError extends Error {
  statusCode: string;
  status: string; // Add statusCode property
  isOperational: boolean; // Add isOperational property
  constructor(message: string, statusCode: string) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true; // Add isOperational assignment
    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = AppError;
