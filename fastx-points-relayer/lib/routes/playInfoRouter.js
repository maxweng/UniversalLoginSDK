
import express from 'express';
import asyncMiddleware from '../middlewares/async_middleware';

export const getPlayerInfo = (fxPointsService) => async (req, res) => {
  const {address} = req.params;
  const result = await fxPointsService.getPlayerInfoByAddress(address);
  const [pID,name,keys,win,gen,aff,ico] = result;
  res.status(200)
    .type('json')
    .send(JSON.stringify({
        balance:keys.toNumber(),
        win: win.toNumber(),
        gen: gen.toNumber(),
        aff: aff.toNumber(),
        name: name.toString(),
    }));
};

export default (fxPointsService) => {
  const router = new express.Router();

  router.get('/:address',
    asyncMiddleware(getPlayerInfo(fxPointsService)));

  return router;
};