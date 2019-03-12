
import {utils} from 'ethers';
import express from 'express';
import asyncMiddleware from '../middlewares/async_middleware';

export const getInfo = (fxPointsService) => async (req, res) => {
  const result = await fxPointsService.getCurrentRoundInfo();
  const {start,roundTime,airDropPot} = result;
  let start = '';
  res.status(200)
    .type('json')
    .send(JSON.stringify({
        roundTime: roundTime,
        start: start.toNumber(),
        end: ends.toNumber(),
        airDropPot:utils.formatEther(airDropPot)
    }));
};

export default (fxPointsService) => {
  const router = new express.Router();

  router.get('/',
    asyncMiddleware(getInfo(fxPointsService)));

  return router;
};
