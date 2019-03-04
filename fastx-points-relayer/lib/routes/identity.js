import express from 'express';
import asyncMiddleware from '../middlewares/async_middleware';
import { retry } from '../utils/utils';

// const retryCount = 3;

// const createAccount = async (identityService, managementKey, ensName) => {
//   for (let i = 1; i<=retryCount; i++){
//     try {
//         const transaction = await identityService.create(managementKey, ensName);
//         return transaction;
//     }catch(err){
//         if(i < retryCount) {
//             console.error("createAccountErr:",i,err)
//         }else{
//             return err;
//         }
//     }
//   }
// }

export const create = (identityService) => async (req, res, next) => {
  const {managementKey, ensName} = req.body;
  //const transaction = await createAccount(identityService, managementKey, ensName);
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

// const executeSigned = async (identityService, body) => {
//   for (let i = 1; i<=retryCount; i++){
//     try {
//         const transaction = await identityService.executeSigned(body);
//         return transaction;
//     }catch(err){
//         if(i < retryCount) {
//             console.error("executeSignedErr:",i,err)
//         }else{
//             return err;
//         }
//     }
//   }
// }

export const execution = (identityService) => async (req, res, next) => {
  //const transaction = await executeSigned(identityService, req.body);
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
};

export default (identityService) => {
  const router = new express.Router();

  router.post('/',
    asyncMiddleware(create(identityService)));

  router.post('/execution',
    asyncMiddleware(execution(identityService)));

  return router;
};
