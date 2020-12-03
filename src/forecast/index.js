import makeForecastEndPointHandler from './forecast-endpoint';

import makeForecastList from './forecast-list';
import makeConsumerList from '../consumer/consumer-list';
import makeAnalysisList from '../analysis/analysis-list';

const forecastList = makeForecastList();
const consumerList = makeConsumerList();
const analysisList = makeAnalysisList();

const forecastEndpointHandler = makeForecastEndPointHandler({
    forecastList,
    consumerList,
    analysisList
});

export default forecastEndpointHandler;
