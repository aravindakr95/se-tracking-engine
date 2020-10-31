import makeAnalysisList from './analysis-list';
import makeAnalysisEndPointHandler from './analysis-endpoint';
import makeConsumerList from '../consumer/consumer-list';
import makePVSBList from '../pvsb/pvsb-list';
import makePGSBList from '../pgsb/pgsb-list';

const analysisList = makeAnalysisList();
const consumerList = makeConsumerList();
const pvsbList = makePVSBList();
const pgsbList = makePGSBList();

const analysisEndpointHandler = makeAnalysisEndPointHandler({
    analysisList,
    consumerList,
    pvsbList,
    pgsbList
});

export default analysisEndpointHandler;
