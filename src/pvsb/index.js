import makePVSBList from './pvsb-list';
import makePVSBEndPointHandler from './pvsb-endpoint';
import makeUserList from '../users/user-list';

const pvsbList = makePVSBList();
const userList = makeUserList();

const pvsbEndpointHandler = makePVSBEndPointHandler({
    pvsbList,
    userList
});

export default pvsbEndpointHandler;
