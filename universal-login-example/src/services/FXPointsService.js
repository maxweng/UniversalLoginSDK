
import {utils, Contract} from 'ethers';
import FXPoints from 'fastx-points-relayer/abi/FXPoints.json';

class FXPointsService {
  constructor(fxPointsContractAddress, provider) {
    this.fxPointsContractAddress = fxPointsContractAddress;
    this.provider = provider;
    this.fxPointsContract = new Contract(this.fxPointsContractAddress, FXPoints.interface, this.provider);
  }

  async getBalance(address) {
    let keys = await this.fxPointsContract.queryKeys(address);
    return utils.formatEther(keys)
  }
}

export default FXPointsService;
