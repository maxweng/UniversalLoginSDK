
import express from 'express';
import asyncMiddleware from '../middlewares/async_middleware';

// export const getBalance = (fxPointsService) => async (req, res) => {
//   const {address} = req.params;
//   const balance = await fxPointsService.getBalance(address);
//   const fxPoints = parseInt(balance, 10);
//   res.status(200)
//     .type('json')
//     .send(JSON.stringify({balance:fxPoints}));
// };

export const finishRound = (fxPointsService) => async (req, res, next) => {
  const {tx, win} = req.body;
  const transaction = await fxPointsService.finishRound(tx, win);
  console.log({'finishRoundResult':transaction})
  if(transaction instanceof Error){
    next(transaction);
  }else{
    res.status(200)
    .type('json')
    .send(JSON.stringify({transaction}));
  }
};

export default (fxPointsService) => {
  const router = new express.Router();

  // router.get('/:address',
  //   asyncMiddleware(getBalance(fxPointsService)));

  router.post('/finishRound',
    asyncMiddleware(finishRound(fxPointsService)));

  return router;
};
