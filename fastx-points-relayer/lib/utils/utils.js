import {providers, utils, Contract, ContractFactory} from 'ethers';
import crypto from 'crypto';
import ENS from 'universal-login-contracts/build/ENS';
import PublicResolver from 'universal-login-contracts/build/PublicResolver';
import Identity from 'universal-login-contracts/build/Identity';
import ERC20 from 'universal-login-contracts/build/ERC20';
import defaultDeployOptions from '../config/defaultDeployOptions';
import fs from 'fs';
import * as migrationListResolver from 'knex/lib/migrate/migration-list-resolver';
import {sleep} from 'universal-login-contracts';

const {namehash} = utils;

const ether = '0x0000000000000000000000000000000000000000';

const signPrivateKey = `-----BEGIN RSA PRIVATE KEY-----
MIICXQIBAAKBgQDCqfobdkCQnztYq/ZUHysDrfzrGoFCzfy9rxJ1tUjmmKApxnOn
iqsn6MqXfCQCboEd/WGNxHGZlORbwGg6BJrM5sAsszHF8fk665Z1mqBnfNg4rBVG
x90V/IsucGf2/7iJSwezWF8vPh+S8BOS8MokymBseB4IkvxI/vgIdlhlZQIDAQAB
AoGAGhXI7BEmibqsqy8v7QnYK8AO2jpNA/SyX4CsSpWmVTAyliZ/rP3J/akWLMJ3
2NOR/cDMZ8DhMCFhkGHyFYQ0cfCZbcI56xNpmzjAkJxeGVNDEe9XV4QJT5prs3tz
V2XFEgI5GBrJ791axbufvTsqkPt+6f8xW2JsBYHWXeZBwmkCQQDyfIsEMYTzJDux
3i9OffwOAKSLsK+dtEagU+CpY1a8cijmfiPBXNwUKlHaaxQFfZ2Rza42KGF1Hb2x
nOBpMbqnAkEAzYMrV6znWQ/rvhHJCh3wfqFS4CqOUjAqm/WZ8X7b0Gh9NswSp3Li
mu1LKLzvPSjX91Zbqtyu4I3Mmn34SNx9EwJADpiyoZD9iMlQkpdmT5pD1u/w97uu
Bpc4fSQvbOLe8L8KeT10l4oocUpO3Q//B4mVN5ai+v2ZSDx/E7b2xz5IFwJBALdq
2TUP6Q6Q6gqiHvZ7kBfEbY4KDSmHOZAmG/XwDcksaIyOiBuQqnQxUsISFcdU+6MR
HREakq1xgOllgkGtH6cCQQC+gFC5qLzrlWKiirfMjrAfoOyujA4Pq5fzu1ssxut/
xegeTBQvXWKukfJZDShL7Ce4AuRIGf3i+TQMTqBs8cYy
-----END RSA PRIVATE KEY-----
`

const addressToBytes32 = (address) =>
  utils.padZeros(utils.arrayify(address), 32);

const waitForContractDeploy = async (providerOrWallet, contractJSON, transactionHash, tick = 1000) => {
  const provider = providerOrWallet.provider ? providerOrWallet.provider : providerOrWallet;
  const abi = contractJSON.interface;
  let receipt = await provider.getTransactionReceipt(transactionHash);
  while (!receipt) {
    await sleep(tick);
    receipt = await provider.getTransactionReceipt(transactionHash);
  }
  return new Contract(receipt.contractAddress, abi, providerOrWallet);
};

const messageSignatureForApprovals = (wallet, id) =>
  wallet.signMessage(
    utils.arrayify(utils.solidityKeccak256(
      ['uint256'],
      [id]),
    ));

const withENS = (provider, ensAddress) => {
  const chainOptions = {ensAddress, chainId: 0};
  return new providers.Web3Provider(provider._web3Provider, chainOptions);
};

const isContract = async (provider, contractAddress) => {
  // TODO: Only whitelisted contracts
  const code = await provider.getCode(contractAddress);
  return !!code;
};

const hasEnoughToken = async (gasToken, identityAddress, gasLimit, provider) => {
  // TODO: Only whitelisted tokens/contracts
  if (gasToken === ether) {
    throw new Error('Ether refunds are not yet supported');
  } else if (!await isContract(provider, gasToken)) {
    throw new Error('Address is not a contract');
  } else {
    const token = new Contract(gasToken, ERC20.interface, provider);
    const identityTokenBalance = await token.balanceOf(identityAddress);
    return identityTokenBalance.gte(utils.bigNumberify(gasLimit));
  }
};

const lookupAddress = async (provider, address) => {
  const node = namehash(`${address.slice(2)}.addr.reverse`.toLowerCase());
  const ens = new Contract(provider.ensAddress, ENS.interface, provider);
  const resolver = await ens.resolver(node);
  const contract = new Contract(resolver, PublicResolver.interface, provider);
  return contract.name(node);
};

const isAddKeyCall = (data) => {
  const addKeySighash = new utils.Interface(Identity.interface).functions.addKey.sighash;
  return addKeySighash === data.slice(0, addKeySighash.length);
};

const getKeyFromData = (data) => {
  const codec = new utils.AbiCoder();
  const addKeySighash = new utils.Interface(Identity.interface).functions.addKey.sighash;
  const [address] = (codec.decode(['bytes32', 'uint256', 'uint256'], data.replace(addKeySighash.slice(2), '')));
  return utils.hexlify(utils.stripZeros(address));
};

const isAddKeysCall = (data) => {
  const addKeysSighash = new utils.Interface(Identity.interface).functions.addKeys.sighash;
  return addKeysSighash === data.slice(0, addKeysSighash.length);
};

const sendAndWaitForTransaction = async (deployer, transaction) => {
  const tx = await deployer.sendTransaction(transaction);
  let receipt = await deployer.provider.getTransactionReceipt(tx.hash);
  while (!receipt || !receipt.blockNumber) {
    await sleep(1000);
    receipt = await deployer.provider.getTransactionReceipt(tx.hash);
  }
  return receipt.contractAddress;
};

const getDeployTransaction = (contractJSON, args = '') => {
  const bytecode = `0x${contractJSON.bytecode}`;
  const abi = contractJSON.interface;
  const transaction = {
    ...defaultDeployOptions,
    ...new ContractFactory(abi, bytecode).getDeployTransaction(...args),
  };
  return transaction;
};

const saveVariables = (filename, variables) => {
  const output = Object.entries(variables)
    .map(([key, value]) => `  ${key}='${value}'`)
    .join('\n');
  fs.writeFile(filename, output, (err) => {
    if (err) {
      return console.error(err);
    }
  });
};

const retry = async (callback, retryCount=3, tick=1000) => {
    if(typeof callback != "function"){
      throw new Error('Paramers is not a function')
    }

    for(let i = 1; i <= retryCount; i++){
      try {
          const result = await callback();
          return result;
      } catch (error) {
        if(i < retryCount) {
            await sleep(tick*i);
            console.error("executeSignedErr:",i,error)
        }else{
            return error;
        }
      }
    }
}

function getClientIp(req){
  var ipAddress;
  var headers = req.headers;
  var forwardedIpsStr = headers['x-real-ip'] || headers['x-forwarded-for'];
  forwardedIpsStr ? ipAddress = forwardedIpsStr : ipAddress = null;
  if (!ipAddress) {
    ipAddress = req.connection.remoteAddress;
  }
  return ipAddress;
};

function verify(req){
  const data = req.body;
  let parasmData = Object.assign({},data);
  delete parasmData.encodeData;
  console.log({
    encodeData: data.encodeData.toString(),
  })
  const decodeData = crypto.privateDecrypt({
    key: signPrivateKey,
    padding: crypto.constants.RSA_PKCS1_PADDING
  }, Buffer.from(data.encodeData.toString('base64'), 'base64'));
  const hashData = crypto.createHash('md5').update(JSON.stringify(parasmData)).digest("hex")
  console.log({
    decodeData,
    hashData
  })
  if(decodeData == hashData){
    return true;
  }else{
    return false;
  }
}


export {verify, getClientIp, sleep, retry, sendAndWaitForTransaction, saveVariables, getDeployTransaction, addressToBytes32, waitForContractDeploy, messageSignatureForApprovals, withENS, lookupAddress, hasEnoughToken, isAddKeyCall, getKeyFromData, isAddKeysCall};
