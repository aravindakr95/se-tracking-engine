import makeUserList from './user-list';
import makeUsersEndpointHandler from './users-endpoint';

const userList = makeUserList();

const usersEndpointHandler = makeUsersEndpointHandler({
    userList
});

export default usersEndpointHandler;
