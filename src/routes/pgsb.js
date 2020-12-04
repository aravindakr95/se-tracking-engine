import express from 'express';

import pgsbController from '../pgsb/pgsb-controller';

import { fieldStateChecker, validate } from '../middlewares/field-validator';

import authenticateJWT from '../middlewares/auth';

let pgsbRouter = express.Router();

pgsbRouter.post('/payloads',
    authenticateJWT,
    validate('pgsb', '/payloads', 'POST'),
    fieldStateChecker,
    (req, res) => {
        pgsbController(req, res);
    });

pgsbRouter.get('/payloads',
    authenticateJWT,
    (req, res) => {
        pgsbController(req, res);
    });

pgsbRouter.post('/errors',
    authenticateJWT,
    validate('pgsb', '/errors', 'POST'),
    fieldStateChecker,
    (req, res) => {
        pgsbController(req, res);
    });

module.exports = pgsbRouter;
