import makeSummaryEndPointHandler from './summary-endpoint';

import makeSummaryList from './summary-list';
import makeConsumerList from '../consumer/consumer-list';
import makePVSBList from '../pvsb/pvsb-list';
import makePGSBList from '../pgsb/pgsb-list';

const summaryList = makeSummaryList();
const consumerList = makeConsumerList();
const pvsbList = makePVSBList();
const pgsbList = makePGSBList();

const summaryEndpointHandler = makeSummaryEndPointHandler({
  summaryList,
  consumerList,
  pvsbList,
  pgsbList,
});

export default summaryEndpointHandler;
