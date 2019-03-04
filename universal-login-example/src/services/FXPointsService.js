
import {utils, Contract} from 'ethers';
import FXPoints from '../../build/FXPoints';

class FXPointsService {
  constructor(fxPointsContractAddress, provider) {
    this.fxPointsContractAddress = fxPointsContractAddress;
    this.provider = provider;
    this.fxPointsContract = new Contract(this.fxPointsContractAddress, FXPoints.interface, this.provider);
  }

  async getBalance(address) {
    let userInfo = await this.fxPointsContract.getPlayerInfoByAddress(address);
    return utils.formatEther(userInfo[2])
  }
}

export default FXPointsService;
