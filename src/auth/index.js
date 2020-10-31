import makeAuthList from './auth-list';
import makeAuthEndPointHandler from './auth-endpoint';
import makeConsumerList from '../consumer/consumer-list';

const authList = makeAuthList();
const consumerList = makeConsumerList();

const authEndpointHandler = makeAuthEndPointHandler({
    authList,
    consumerList
});

export default authEndpointHandler;
