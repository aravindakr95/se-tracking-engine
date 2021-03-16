import express from 'express';

import pvsbController from '../pvsb/pvsb-controller';

import { fieldStateChecker, validate } from '../middlewares/field-validator';

import authenticateJWT from '../middlewares/auth-jwt';

const pvsbRouter = express.Router();

pvsbRouter.post('/payloads',
  authenticateJWT,
  validate('pvsb', '/payloads', 'POST'),
  fieldStateChecker,
  (req, res) => {
    pvsbController(req, res);
  });

pvsbRouter.get('/payloads',
  authenticateJWT,
  (req, res) => {
    pvsbController(req, res);
  });

pvsbRouter.post('/errors',
  authenticateJWT,
  validate('pvsb', '/errors', 'POST'),
  fieldStateChecker,
  (req, res) => {
    pvsbController(req, res);
  });

export default pvsbRouter;
