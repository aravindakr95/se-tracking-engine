exports.httpErrorStatusMapper = (statusCode) => {
    switch (statusCode) {
    case 400:
        return 'SETE-4000';
    case 401:
        return 'SETE-4001';
    case 403:
        return 'SETE-4030';
    case 404:
        return 'SETE-4040';
    case 405:
        return 'SETE-4050';
    case 408:
        return 'SETE-4080';
    case 409:
        return 'SETE-4090';
    case 422:
        return 'SETE-4220';
    case 500:
        return 'SETE-5000';
    case 502:
        return 'SETE-5020';
    case 503:
        return 'SETE-5030';
    default:
        return 'SETE-0000';
    }
};
