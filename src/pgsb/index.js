import makePGSBList from './pgsb-list';
import makePGSBEndPointHandler from './pgsb-endpoint';
import makeUserList from '../users/user-list';

const pgsbList = makePGSBList();
const userList = makeUserList();

const pgsbEndpointHandler = makePGSBEndPointHandler({
    pgsbList,
    userList
});

export default pgsbEndpointHandler;
