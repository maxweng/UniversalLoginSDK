const config = require('../lib/config/relayer');
const {getWallets, deployContract} = require('ethereum-waffle');
const {Wallet, ethers} = require('ethers');
const fs = require('fs');
const Clicker = require('../abi/Clicker');
const Token = require('../abi/Token');
const PlayerBook = require('../abi/PlayerBook');
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

  async add() {
    console.log('adding fxpoints system ...')
    const tx = await this.playerBookContract.addGame(this.fxPointsContract.address.toString(), "fxp", {gasLimit:400000})
    console.log({tx})
  }

  async activate() {
    console.log('activating fxpoints ...')
    let tx = await this.fxPointsContract.activate()
    console.log({tx})
    await tx.wait()
  }

  async main() {
    this.provider = new ethers.providers.JsonRpcProvider(jsonRpcUrl);
    // this.wallets = await getWallets(this.provider);
    // this.deployer = this.wallets[this.wallets.length - 1];
    this.deployer = new Wallet(privateKey, this.provider);

    console.log('deploying clickerContract ...')
    const clickerContract = await deployContract(this.deployer, Clicker);

    console.log('deploying tokenContract ...')
    const tokenContract = await deployContract(this.deployer, Token);

    console.log('deploying playerBookContract ...')
    this.playerBookContract = await deployContract(
        this.deployer, PlayerBook, [], {gasLimit:0x6691b7}
      );

    console.log('deploying fxPointsContract ...')
    this.fxPointsContract = await deployContract(
      this.deployer, FXPoints, [this.playerBookContract.address]);

    const variables = {};

    variables.CLICKER_CONTRACT_ADDRESS = clickerContract.address;
    variables.TOKEN_CONTRACT_ADDRESS = tokenContract.address;
    variables.PLAYERBOOK_CONTRACT_ADDRESS = this.playerBookContract.address;
    variables.FXPOINTS_CONTRACT_ADDRESS = this.fxPointsContract.address;
    
    console.log({variables})

    console.log('all deployed!')
    
    try{
      await this.add()
    } catch (err) {
      console.log({err})
      await this.add()
    }

    try{
      await this.activate()
    } catch (err) {
      console.log({err})
      await this.activate()
    }

    let activated = await this.fxPointsContract.activated_()
    
    console.log(`FXPoints contracts deployed -> ${activated}`)

    //this.save('../.env', variables);
  }
}

const prepare = new ContractsDeployer();
prepare.main();
