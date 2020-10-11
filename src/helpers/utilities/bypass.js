export const bypassHelper = {
    shouldBypass
};

function shouldBypass(req) {
    let bypassEndpoints = []; //todo: add bypass endpoints here

    return bypassEndpoints.includes(req.baseUrl) && req.method === 'GET';
}
