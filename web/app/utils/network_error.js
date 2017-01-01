function NetworkError(message) {
  this.name = "NetworkError";
  this.message = (message || "");
}

NetworkError.prototype = Error.prototype;

export default NetworkError;