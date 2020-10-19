import makeAuthList from './auth-list';
import makeAuthEndPointHandler from './auth-endpoint';
import makeUserList from '../users/user-list';

const authList = makeAuthList();
const userList = makeUserList();

const authEndpointHandler = makeAuthEndPointHandler({
    authList,
    userList
});

export default authEndpointHandler;
