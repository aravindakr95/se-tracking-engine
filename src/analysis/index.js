import makeAnalysisList from './analysis-list';
import makeAnalysisEndPointHandler from './analysis-endpoint';
import makeUserList from '../users/user-list';
import makePVSBList from '../pvsb/pvsb-list';
import makePGSBList from '../pgsb/pgsb-list';

const analysisList = makeAnalysisList();
const userList = makeUserList();
const pvsbList = makePVSBList();
const pgsbList = makePGSBList();

const analysisEndpointHandler = makeAnalysisEndPointHandler({
    analysisList,
    userList,
    pvsbList,
    pgsbList
});

export default analysisEndpointHandler;
