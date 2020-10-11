import makeAuthList from './auth-list';
import makeAuthEndPointHandler from './auth-endpoint';

const userList = makeAuthList();
const authEndpointHandler = makeAuthEndPointHandler({
    userList
});

export default authEndpointHandler;
