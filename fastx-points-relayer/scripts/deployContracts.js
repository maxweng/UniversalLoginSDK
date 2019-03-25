const config = require('../lib/config/relayer');
const {getWallets, deployContract} = require('ethereum-waffle');
const {Wallet, ethers} = require('ethers');
const fs = require('fs');
const Token = require('../abi/Token');
const FXPoints = require('../abi/FXPoints');

const {jsonRpcUrl,privateKey} = config;

/* eslint-disable no-console */
class ContractsDeployer {

  async main() {
    this.provider = new ethers.providers.JsonRpcProvider(jsonRpcUrl);
    // this.wallets = await getWallets(this.provider);
    // this.deployer = this.wallets[this.wallets.length - 1];
    this.deployer = new Wallet(privateKey, this.provider);
    this.deployerAddr= this.deployer.signingKey.address;
    console.log('deployer address:',this.deployerAddr)

    console.log('deploying tokenContract ...')
    const tokenContract = await deployContract(this.deployer, Token);

    console.log('deploying fxPointsContract ...')
    this.fxPointsContract = await deployContract(this.deployer, FXPoints,[], {gasLimit:5000000});

    const variables = {};
    variables.TOKEN_CONTRACT_ADDRESS = tokenContract.address;
    variables.FXPOINTS_CONTRACT_ADDRESS = this.fxPointsContract.address;
    console.log({variables})
    console.log('all deployed!')

    // console.log("add team member ...")
    // const ret = await this.fxPointsContract.addTeamMember(this.deployerAddr, 100, { from: this.deployerAddr })
    // console.log({ret})

    // console.log("activate game ...")
    // const tx = await this.fxPointsContract.activateGame({ from: this.deployerAddr,gasPrice: 31000000000000,gasLimit: 1000000});
    // console.log("activateGame tx is: ",tx)

    // const jackpotEth = await this.fxPointsContract.getJackpotEth.call();
    // console.log({jackpotEth})
  }
}

const prepare = new ContractsDeployer();
prepare.main();
