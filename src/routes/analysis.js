import express from 'express';

import analysisController from '../analysis/analysis-controller';
import { fieldStateChecker, validate } from '../middlewares/field-validator';

let analysisRouter = express.Router();

analysisRouter.get('/reports/:_id',
    validate('analysis', '/reports/:_id', 'GET'),
    fieldStateChecker,
    (req, res) => {
        analysisController(req, res);
    });


analysisRouter.get('/reports',
    (req, res) => {
        analysisController(req, res);
    });

analysisRouter.post('/reports/generate',
    validate('analysis', '/reports/generate', 'POST'),
    fieldStateChecker,
    (req, res) => {
        analysisController(req, res);
    });

analysisRouter.post('/reports/dispatch',
    validate('analysis', '/reports/dispatch', 'POST'),
    fieldStateChecker,
    (req, res) => {
        analysisController(req, res);
    });

module.exports = analysisRouter;
