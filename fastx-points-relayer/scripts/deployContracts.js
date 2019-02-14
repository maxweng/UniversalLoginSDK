const config = require('../lib/config/relayer');
const {getWallets, deployContract} = require('ethereum-waffle');
const {Wallet, ethers} = require('ethers');
const fs = require('fs');
const Clicker = require('../abi/Clicker');
const Token = require('../abi/Token');
const FXPoints = require('../abi/FXPoints');

const {jsonRpcUrl,privateKey} = config;

/* eslint-disable no-console */
class ContractsDeployer {
  save(filename, _variables) {
    const variables = Object.entries(_variables)
      .map(([key, value]) => `  ${key}='${value}'`)
      .join('\n');
    fs.writeFile(filename, variables, (err) => {
      if (err) {
        return console.error(err);
      }
      console.log(`${filename} file updated.`);
    });
  }

  async main() {
    this.provider = new ethers.providers.JsonRpcProvider(jsonRpcUrl);
    // this.wallets = await getWallets(this.provider);
    // this.deployer = this.wallets[this.wallets.length - 1];
    this.deployer = new Wallet(privateKey, this.provider);
    const clickerContract = await deployContract(this.deployer, Clicker);
    const tokenContract = await deployContract(this.deployer, Token);
    const fxPointsContract = await deployContract(this.deployer, FXPoints);
    const variables = {};
    variables.CLICKER_CONTRACT_ADDRESS = clickerContract.address;
    variables.TOKEN_CONTRACT_ADDRESS = tokenContract.address;
    variables.FXPOINTS_CONTRACT_ADDRESS = fxPointsContract.address;
    console.log({
      clickerContract:clickerContract.address,
      tokenContract:tokenContract.address,
      fxPointsContract:fxPointsContract.address
    })
    //this.save('../.env', variables);
  }
}

const prepare = new ContractsDeployer();
prepare.main();
