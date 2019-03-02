import express from 'express';
import asyncMiddleware from '../middlewares/async_middleware';

const retyCount = 3;

const createAccount = async (identityService, managementKey, ensName) => {
  for (let i = 1; i<=retyCount; i++){
    try {
      const transaction = await identityService.create(managementKey, ensName);
        break;
    }catch(err){
        if(i <= retyCount.count) {
            console.error("createAccountErr:",i,err)
        }else{
            return err;
        }
    }
  }
}

export const create = (identityService) => async (req, res, next) => {
  const {managementKey, ensName} = req.body;
  const transaction = await createAccount(identityService, managementKey, ensName);
  console.log({transaction})
  if(transaction instanceof Error){
    next(transaction);
  }else{
    res.status(201)
    .type('json')
    .send(JSON.stringify({transaction}));
  }
};

const executeSigned = async (identityService, body) => {
  for (let i = 1; i<=retyCount; i++){
    try {
        accounts = await identityService.executeSigned(body);;
        break;
    }catch(err){
        if(i <= retyCount.count) {
            console.error("executeSignedErr:",i,err)
        }else{
            return err;
        }
    }
  }
}

export const execution = (identityService) => async (req, res, next) => {
  console.log('execution')
  const transaction = await executeSigned(identityService, req.body);
  console.log({transaction})
  if(transaction instanceof Error){
    next(transaction);
  }else{
    res.status(201)
    .type('json')
    .send(JSON.stringify({transaction}));
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
