import express from 'express';

import analysisController from '../analysis/analysis-controller';
import filterRoute from '../middlewares/route-filter';
import { fieldStateChecker, validate } from '../middlewares/field-validator';

let analysisRouter = express.Router();

analysisRouter.get('/reports/:_id',
    filterRoute,
    (req, res) => {
        analysisController(req, res);
    });


analysisRouter.get('/reports',
    filterRoute,
    (req, res) => {
        analysisController(req, res);
    });

analysisRouter.post('/reports/generate',
    filterRoute,
    validate('reports', '/reports/generate', 'POST'),
    fieldStateChecker,
    (req, res) => {
        analysisController(req, res);
    });

analysisRouter.post('/reports/dispatch',
    filterRoute,
    validate('reports', '/reports/dispatch', 'POST'),
    fieldStateChecker,
    (req, res) => {
        analysisController(req, res);
    });

module.exports = analysisRouter;
