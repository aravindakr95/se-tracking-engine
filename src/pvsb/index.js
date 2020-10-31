import makePVSBList from './pvsb-list';
import makePVSBEndPointHandler from './pvsb-endpoint';
import makeConsumerList from '../consumer/consumer-list';

const pvsbList = makePVSBList();
const consumerList = makeConsumerList();

const pvsbEndpointHandler = makePVSBEndPointHandler({
    pvsbList,
    consumerList
});

export default pvsbEndpointHandler;
