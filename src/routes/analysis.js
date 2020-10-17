import express from 'express';

import analysisController from '../analysis/analysis-controller';
import filterRoute from '../middlewares/route-filter';

let analysisRouter = express.Router();

analysisRouter.get('/reports',
    filterRoute,
    (req, res) => {
        analysisController(req, res);
    });

analysisRouter.get('/reports/:id',
    filterRoute,
    (req, res) => {
        analysisController(req, res);
    });

analysisRouter.post('/reports',
    filterRoute,
    (req, res) => {
        analysisController(req, res);
    });

module.exports = analysisRouter;
