import express from 'express';
import IdentityRouter from './routes/identity';
import ConfigRouter from './routes/config';
import RequestAuthorisationRouter from './routes/authorisation';
import FastxPointsRouter from './routes/fastxPoints';
import FXInfoRouter from './routes/fxInfoRouter';
import IdentityService from './services/IdentityService';
import FXPointsService from './services/fxPointsService';
import ENSService from './services/ensService';
import bodyParser from 'body-parser';
import {Wallet, providers} from 'ethers';
import cors from 'cors';
import AuthorisationService from './services/authorisationService';
import {EventEmitter} from 'fbemitter';
import useragent from 'express-useragent';
import {utils, Contract}  from 'ethers';
import {waitToBeMined} from 'universal-login-contracts';
import Token from '../abi/Token';

const defaultPort = 3311;

function errorHandler(err, req, res, next) {
  res.status(500)
    .type('json')
    .send(JSON.stringify({error: err.toString()}));
}

class Relayer {
  constructor(config, database, provider = '') {
    this.port = config.port || defaultPort;
    this.config = config;
    this.hooks = new EventEmitter();
    this.provider = provider || new providers.JsonRpcProvider(config.jsonRpcUrl, config.chainSpec);
    this.wallet = new Wallet(config.privateKey, this.provider);
    this.database = database;
    this.tokenContractAddress = config.tokenContractAddress;
    this.tokenContract = new Contract(this.tokenContractAddress, Token.interface, this.wallet);
    this.addHooks();
  }

  addHooks() {
    const tokenAmount = utils.parseEther('100');
    const etherAmount = utils.parseEther('100');
    this.hooks.addListener('created', async (transaction) => {
      const receipt = await waitToBeMined(this.provider, transaction.hash);
      if (receipt.status) {
        console.log(receipt.contractAddress)
        console.log({
          tokenAmount
        })
        const tokenTransaction = await this.tokenContract.transfer(receipt.contractAddress, tokenAmount);
        await waitToBeMined(this.provider, tokenTransaction.hash);
        const transaction = {
          to: receipt.contractAddress,
          value: etherAmount
        };
        await this.wallet.sendTransaction(transaction);
      }
    });
  }

  async start() {
    this.database.migrate.latest();
    this.runServer();
    await this.ensService.start();
    console.log('Relayer is start')
  }

  runServer() {
    this.app = express();
    this.app.use(useragent.express());
    this.app.use(cors({
      origin : '*',
      credentials: true,
    }));
    this.ensService = new ENSService(this.config.chainSpec.ensAddress, this.config.ensRegistrars, this.provider, this.config.chainSpec.publicResolverAddress);
    this.authorisationService = new AuthorisationService(this.database);
    this.identityService = new IdentityService(this.wallet, this.ensService, this.authorisationService, this.hooks, this.provider, this.config.legacyENS);
    this.fXPointsService = new FXPointsService(this.config.fxPointsContractAddress,this.provider)
    this.app.use(bodyParser.json());
    this.app.use('/identity', IdentityRouter(this.identityService));
    this.app.use('/config', ConfigRouter(this.config.chainSpec));
    this.app.use('/authorisation', RequestAuthorisationRouter(this.authorisationService));
    this.app.use('/fastxPoints',FastxPointsRouter(this.fXPointsService));
    this.app.use('/getFXPInfo', FXInfoRouter())
    this.app.use(errorHandler);
    this.server = this.app.listen(this.port);
  }

  async stop() {
    this.database.destroy();
    this.server.close();
  }
}

export default Relayer;
