function normalizeRequest(req = {}) {
  return Object.freeze({
    host: req.hostname,
    path: req.path,
    method: req.method,
    pathParams: req.params,
    queryParams: req.query,
    body: req.body,
  });
}

function objectHandler(data) {
  return {
    data,
  };
}

export { normalizeRequest, objectHandler };
