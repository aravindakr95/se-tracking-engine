import makeAnalysisEndPointHandler from './analysis-endpoint';

import makeAnalysisList from './analysis-list';
import makeConsumerList from '../consumer/consumer-list';
import makePVSBList from '../pvsb/pvsb-list';
import makePGSBList from '../pgsb/pgsb-list';
import makeForecastList from '../forecast/forecast-list';

const analysisList = makeAnalysisList();
const consumerList = makeConsumerList();
const pvsbList = makePVSBList();
const pgsbList = makePGSBList();
const forecastList = makeForecastList();

const analysisEndpointHandler = makeAnalysisEndPointHandler({
    analysisList,
    consumerList,
    pvsbList,
    pgsbList,
    forecastList
});

export default analysisEndpointHandler;
