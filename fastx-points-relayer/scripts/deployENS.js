const config = require('../lib/config/relayer');
import ENSDeployer from '../lib/utils/ensDeployer';

const {jsonRpcUrl, privateKey, ensRegistrars} = config;

// const ensRegistrars = {'fastx.eth': []};
// const jsonRpcUrl = 'http://localhost:18545';

console.log({ensRegistrars})

const [, tld] = ensRegistrars[0].split('.');

console.log({tld})

ENSDeployer.deploy(jsonRpcUrl, privateKey, ensRegistrars, tld).catch(console.error);

