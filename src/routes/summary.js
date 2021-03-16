import express from 'express';

import summaryController from '../summary/summary-controller';

import { fieldStateChecker, validate } from '../middlewares/field-validator';

import authenticateJWT from '../middlewares/auth-jwt';

const summaryRouter = express.Router();

summaryRouter.post('/generate',
  authenticateJWT,
  validate('summary', '/generate', 'POST'),
  fieldStateChecker,
  (req, res) => {
    summaryController(req, res);
  });

summaryRouter.get('/',
  authenticateJWT,
  (req, res) => {
    summaryController(req, res);
  });

export default summaryRouter;
