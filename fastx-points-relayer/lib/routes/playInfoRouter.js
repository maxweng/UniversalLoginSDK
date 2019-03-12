
import {utils} from 'ethers';
import express from 'express';
import asyncMiddleware from '../middlewares/async_middleware';

export const getPlayerInfo = (fxPointsService) => async (req, res) => {
  const {address} = req.params;
  const result = await fxPointsService.getPlayerInfoByAddress(address);
  const {keys,balance} = result;
  res.status(200)
    .type('json')
    .send(JSON.stringify({
      keys: utils.formatEther(keys),
      balance: utils.formatEther(balance)
    }));
};

export default (fxPointsService) => {
  const router = new express.Router();

  router.get('/:address',
    asyncMiddleware(getPlayerInfo(fxPointsService)));

  return router;
};
