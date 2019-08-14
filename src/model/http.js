const HttpStatus = {
  success: 0,
  error: 1
};
class httpResponse {
  constructor(status, data, desc = '') {
    this.status = status;
    this.result = data;
    this.desc = desc;
  }
}

exports.Http = {
  HttpStatus,
  httpResponse
}