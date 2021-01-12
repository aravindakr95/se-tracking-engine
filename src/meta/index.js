import makeMetaList from './meta-list';
import makeMetaEndPointHandler from './meta-endpoint';

const metaList = makeMetaList();

const metaEndpointHandler = makeMetaEndPointHandler({
    metaList
});

export default metaEndpointHandler;
