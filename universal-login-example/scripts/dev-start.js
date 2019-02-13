import {deployContract} from 'ethereum-waffle';
import Clicker from '../build/Clicker';
import FXPoints from '../build/FXPoints';
import {startDevelopment, createEnv, spawnProcess} from 'universal-login-ops';


async function deployClickerContract(deployWallet) {
  const clickerContract = await deployContract(deployWallet, Clicker);
  console.log(`Clicker contract address: ${clickerContract.address}`);
  return clickerContract.address;
}

async function deployFXPointsContract(deployWallet) {
  const fxPointsContract = await deployContract(deployWallet, FXPoints);
  console.log(`FXPoints contract address: ${fxPointsContract.address}`);
  return fxPointsContract.address;
}

function runWebServer(vars) {
  const env = {...process.env, ...vars};
  spawnProcess('web', 'yarn', ['start'], {env});
}

async function start() {
  const artefacts = await startDevelopment();
  const env = createEnv(artefacts);
  env.CLICKER_CONTRACT_ADDRESS = await deployClickerContract(artefacts.deployWallet);
  env.FXPOINTS_CONTRACT_ADDRESS = await deployFXPointsContract(artefacts.deployWallet);
  runWebServer(env);
}

start().catch(console.error);
