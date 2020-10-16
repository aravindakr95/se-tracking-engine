import express from 'express';

import filterRoute from '../middlewares/route-filter';

import pvsbController from '../pvsb/pvsb-controller';

import { fieldStateChecker, validate } from '../middlewares/field-validator';

let pvsbRouter = express.Router();

pvsbRouter.post('/payloads',
    filterRoute,
    validate('pvsb', '/payloads', 'POST'),
    fieldStateChecker,
    (req, res) => {
        pvsbController(req, res);
    });

pvsbRouter.get('/payloads',
    filterRoute,
    (req, res) => {
        pvsbController(req, res);
    });

pvsbRouter.post('/errors',
    filterRoute,
    validate('pvsb', '/errors', 'POST'),
    fieldStateChecker,
    (req, res) => {
        pvsbController(req, res);
    });

module.exports = pvsbRouter;
