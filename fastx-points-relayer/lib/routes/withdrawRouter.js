


import express from 'express';
import asyncMiddleware from '../middlewares/async_middleware';

export const withdraw = (fxPointsService) => async (req, res) => {
  const {address} = req.body;
  const result = await fxPointsService.withdraw(address);
 
  res.status(200)
    .type('json')
    .send(JSON.stringify({
        tx: result
    }));
};

export default (fxPointsService) => {
  const router = new express.Router();

  router.get('/',
    asyncMiddleware(withdraw(fxPointsService)));

  return router;
};
