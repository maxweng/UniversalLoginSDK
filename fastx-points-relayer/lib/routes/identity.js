import express from 'express';
import asyncMiddleware from '../middlewares/async_middleware';
import { retry, getClientIp, verify } from '../utils/utils';

export const create = (identityService) => async (req, res, next) => {
  const {managementKey, ensName} = req.body;
    const transaction = await retry(async function(){
      return await await identityService.create(managementKey, ensName);
    })
    if(transaction instanceof Error){
      next(transaction);
    }else{
      res.status(201)
      .type('json')
      .send(JSON.stringify({transaction}));
  }
};

export const execution = (identityService) => async (req, res, next) => {
  if(verify(req)){
    const transaction = await retry(async function(){
      return await identityService.executeSigned(req.body);
    })
    
    console.log({transaction})
    if(transaction instanceof Error){
      next(transaction);
    }else{
      res.status(201)
      .type('json')
      .send(JSON.stringify({transaction}));
    }
  }else{
    next(new Error('没有权限'));
  }
};

export default (identityService) => {
  const router = new express.Router();

  router.post('/',
    asyncMiddleware(create(identityService)));

  router.post('/execution',
    asyncMiddleware(execution(identityService)));

  return router;
};
