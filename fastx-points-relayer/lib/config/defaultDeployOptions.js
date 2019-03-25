import {utils} from 'ethers';

const defaultDeployOptions = {
  gasLimit: utils.bigNumberify(5000000),
  gasPrice: utils.bigNumberify(9000000000),
};

export default defaultDeployOptions;
