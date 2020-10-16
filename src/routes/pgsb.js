import express from 'express';

import filterRoute from '../middlewares/route-filter';

import pgsbController from '../pgsb/pgsb-controller';

import { fieldStateChecker, validate } from '../middlewares/field-validator';

let pgsbRouter = express.Router();

pgsbRouter.post('/payloads',
    filterRoute,
    validate('pgsb', '/payloads', 'POST'),
    fieldStateChecker,
    (req, res) => {
        pgsbController(req, res);
    });

pgsbRouter.get('/payloads',
    filterRoute,
    (req, res) => {
        pgsbController(req, res);
    });

pgsbRouter.post('/errors',
    filterRoute,
    validate('pgsb', '/errors', 'POST'),
    fieldStateChecker,
    (req, res) => {
        pgsbController(req, res);
    });

module.exports = pgsbRouter;
