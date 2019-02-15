
import express from 'express';
import asyncMiddleware from '../middlewares/async_middleware';

export const getInfo = () => async (req, res) => {
  let time = new Date('2019-03-01 00:00').getTime()-new Date().getTime();
  res.status(200)
    .type('json')
    .send(JSON.stringify({
        timeLeft: parseInt(time/1000),
        airDropPot:9999
    }));
};

export default () => {
  const router = new express.Router();

  router.get('/',
    asyncMiddleware(getInfo()));

  return router;
};
