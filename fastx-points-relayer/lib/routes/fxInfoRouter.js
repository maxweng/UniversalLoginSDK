
import {utils} from 'ethers';
import express from 'express';
import asyncMiddleware from '../middlewares/async_middleware';

export const getInfo = (fxPointsService) => async (req, res) => {
  const result = await fxPointsService.getCurrentRoundInfo();
  const {roundId,start,roundTime,airDropPot} = result;
  res.status(200)
    .type('json')
    .send(JSON.stringify({
        roundId: roundId.toNumber(),
        roundTime: roundTime.toNumber(),
        start: start.toNumber(),
        end: start.toNumber()+roundTime.toNumber(),
        airDropPot:utils.formatEther(airDropPot)
    }));
};

export default (fxPointsService) => {
  const router = new express.Router();

  router.get('/',
    asyncMiddleware(getInfo(fxPointsService)));

  return router;
};
