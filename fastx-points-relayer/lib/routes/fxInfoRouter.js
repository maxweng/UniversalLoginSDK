
import {utils} from 'ethers';
import express from 'express';
import asyncMiddleware from '../middlewares/async_middleware';

export const getInfo = (fxPointsService) => async (req, res) => {

  const result = await fxPointsService.getCurrentRoundInfo();
  const [ICO,roundId,totalKeys,ends,started,currentPot,leaderAddr,leaderName,,airDropPot] = result;
  let time = ends.toNumber()-started.toNumber();
  res.status(200)
    .type('json')
    .send(JSON.stringify({
        roundId: roundId.toNumber(),
        currentPot: utils.formatEther(currentPot),
        totalKeys: utils.formatEther(totalKeys),
        leaderAddr: leaderAddr.toString(),
        leaderName: leaderName.toString(),
        timeLeft: parseInt(time),
        airDropPot:utils.formatEther(airDropPot)
    }));
};

export default (fxPointsService) => {
  const router = new express.Router();

  router.get('/',
    asyncMiddleware(getInfo(fxPointsService)));

  return router;
};
