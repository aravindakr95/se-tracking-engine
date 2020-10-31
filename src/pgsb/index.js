import makePGSBList from './pgsb-list';
import makePGSBEndPointHandler from './pgsb-endpoint';
import makeConsumerList from '../consumer/consumer-list';

const pgsbList = makePGSBList();
const consumerList = makeConsumerList();

const pgsbEndpointHandler = makePGSBEndPointHandler({
    pgsbList,
    consumerList
});

export default pgsbEndpointHandler;
