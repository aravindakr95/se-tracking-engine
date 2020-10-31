import makeConsumerList from './consumer-list';
import makeConsumerEndpointHandler from './consumer-endpoint';

const consumerList = makeConsumerList();

const consumerEndpointHandler = makeConsumerEndpointHandler({
    consumerList
});

export default consumerEndpointHandler;
