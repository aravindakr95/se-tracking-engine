import makePVSBList from './pvsb-list';
import makePVSBEndPointHandler from './pvsb-endpoint';

const pvsbList = makePVSBList();
const pvsbEndpointHandler = makePVSBEndPointHandler({
    pvsbList
});

export default pvsbEndpointHandler;
