import ENSDeployer from '../lib/utils/ensDeployer';

const ensRegistrars = {'fastx.eth': []};
const jsonRpcUrl = 'http://localhost:18545';

ENSDeployer.deploy(jsonRpcUrl, ensRegistrars, 'eth').catch(console.error);

