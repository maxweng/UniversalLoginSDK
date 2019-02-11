
const FXPoints = require('../../build/FXPoints');
const {deployContract} = require('ethereum-waffle');

async function deployFXPoints(deployWallet) {
  const {address} = await deployContract(deployWallet, FXPoints);
  console.log(`FXPoints contract address: ${address}`);
  return address;
}

module.exports = deployFXPoints;
