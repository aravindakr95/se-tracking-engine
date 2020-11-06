import express from 'express';

import pgsbController from '../pgsb/pgsb-controller';

import { fieldStateChecker, validate } from '../middlewares/field-validator';

let pgsbRouter = express.Router();

pgsbRouter.post('/payloads',
    validate('pgsb', '/payloads', 'POST'),
    fieldStateChecker,
    (req, res) => {
        pgsbController(req, res);
    });

pgsbRouter.get('/payloads',
    (req, res) => {
        pgsbController(req, res);
    });

pgsbRouter.post('/errors',
    validate('pgsb', '/errors', 'POST'),
    fieldStateChecker,
    (req, res) => {
        pgsbController(req, res);
    });

module.exports = pgsbRouter;
