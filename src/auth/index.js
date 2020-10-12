import makeAuthList from './auth-list';
import makeAuthEndPointHandler from './auth-endpoint';

const authList = makeAuthList();
const authEndpointHandler = makeAuthEndPointHandler({
    authList
});

export default authEndpointHandler;
