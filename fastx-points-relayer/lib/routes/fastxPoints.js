
import express from 'express';
import asyncMiddleware from '../middlewares/async_middleware';

export const getBalance = (fxPointsService) => async (req, res) => {
  const {address} = req.params;
  const balance = await fxPointsService.getBalance(address);
  const fxPoints = parseInt(balance, 10);
  res.status(200)
    .type('json')
    .send(JSON.stringify({balance:fxPoints}));
};

export default (fxPointsService) => {
  const router = new express.Router();

  router.get('/:address',
    asyncMiddleware(getBalance(fxPointsService)));

  return router;
};
