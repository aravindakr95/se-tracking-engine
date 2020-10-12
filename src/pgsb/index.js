import makePGSBList from './pgsb-list';
import makePGSBEndPointHandler from './pgsb-endpoint';

const pgsbList = makePGSBList();
const pgsbEndpointHandler = makePGSBEndPointHandler({
    pgsbList
});

export default pgsbEndpointHandler;
