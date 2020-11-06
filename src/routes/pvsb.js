import express from 'express';

import pvsbController from '../pvsb/pvsb-controller';

import { fieldStateChecker, validate } from '../middlewares/field-validator';

let pvsbRouter = express.Router();

pvsbRouter.post('/payloads',
    validate('pvsb', '/payloads', 'POST'),
    fieldStateChecker,
    (req, res) => {
        pvsbController(req, res);
    });

pvsbRouter.get('/payloads',
    (req, res) => {
        pvsbController(req, res);
    });

pvsbRouter.post('/errors',
    validate('pvsb', '/errors', 'POST'),
    fieldStateChecker,
    (req, res) => {
        pvsbController(req, res);
    });

module.exports = pvsbRouter;
