function extend(child, parent) {
  child.prototype = Object.create(parent.prototype);
  child.prototype.constructor = child;
}

function FailureError(message) {
  this.name = "FailureError";
  this.message = message;
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, FailureError);
  }
}
extend(FailureError, Error);

module.exports = FailureError;
