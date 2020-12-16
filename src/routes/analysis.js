import express from 'express';

import analysisController from '../analysis/analysis-controller';
import { fieldStateChecker, validate } from '../middlewares/field-validator';

import authenticateJWT from '../middlewares/auth-jwt';

let analysisRouter = express.Router();

analysisRouter.get('/reports/:_id',
    authenticateJWT,
    validate('analysis', '/reports/:_id', 'GET'),
    fieldStateChecker,
    (req, res) => {
        analysisController(req, res);
    });


analysisRouter.get('/reports',
    authenticateJWT,
    (req, res) => {
        analysisController(req, res);
    });

analysisRouter.post('/reports/generate',
    authenticateJWT,
    validate('analysis', '/reports/generate', 'POST'),
    fieldStateChecker,
    (req, res) => {
        analysisController(req, res);
    });

analysisRouter.post('/reports/dispatch',
    authenticateJWT,
    validate('analysis', '/reports/dispatch', 'POST'),
    fieldStateChecker,
    (req, res) => {
        analysisController(req, res);
    });

module.exports = analysisRouter;
