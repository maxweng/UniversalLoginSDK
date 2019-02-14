const config = require('../lib/config/relayer');
const {getWallets, deployContract} = require('ethereum-waffle');
const {Wallet, ethers} = require('ethers');
const fs = require('fs');
const Resolver = require('../abi/PublicResolver');

const {jsonRpcUrl,privateKey,chainSpec} = config;

class ContractsDeployer {
  async main() {
    this.provider = new ethers.providers.JsonRpcProvider(jsonRpcUrl);
    this.deployer = new Wallet(privateKey, this.provider);
    const resolveContract = await deployContract(this.deployer, Resolver, [chainSpec.ensAddress]);
    console.log({
        resolveContract:resolveContract.address
    })
  }
}

const prepare = new ContractsDeployer();
prepare.main();
