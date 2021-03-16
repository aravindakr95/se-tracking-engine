import makeAnalysisEndPointHandler from './analysis-endpoint';

import makeAnalysisList from './analysis-list';
import makeConsumerList from '../consumer/consumer-list';
import makeForecastList from '../forecast/forecast-list';
import makeSummaryList from '../summary/summary-list';

const analysisList = makeAnalysisList();
const consumerList = makeConsumerList();
const forecastList = makeForecastList();
const summaryList = makeSummaryList();

const analysisEndpointHandler = makeAnalysisEndPointHandler({
  analysisList,
  consumerList,
  forecastList,
  summaryList,
});

export default analysisEndpointHandler;
