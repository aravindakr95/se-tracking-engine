import express from 'express';

import metaController from '../meta/meta-controller';

import authenticateJWT from '../middlewares/auth-jwt';

let metaRouter = express.Router();

metaRouter.get('/version',
    authenticateJWT,
    (req, res) => {
        metaController(req, res);
    });

module.exports = metaRouter;
