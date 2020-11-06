import express from 'express';

import analysisController from '../analysis/analysis-controller';
import filterRoute from '../middlewares/route-filter';
import { fieldStateChecker, validate } from '../middlewares/field-validator';

let analysisRouter = express.Router();

analysisRouter.get('/reports/:_id',
    filterRoute,
    validate('analysis', '/reports/:_id', 'GET'),
    fieldStateChecker,
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
    validate('analysis', '/reports/generate', 'POST'),
    fieldStateChecker,
    (req, res) => {
        analysisController(req, res);
    });

analysisRouter.post('/reports/dispatch',
    filterRoute,
    validate('analysis', '/reports/dispatch', 'POST'),
    fieldStateChecker,
    (req, res) => {
        analysisController(req, res);
    });

module.exports = analysisRouter;
