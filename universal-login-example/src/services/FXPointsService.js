
import {utils, Contract} from 'ethers';
import FXPoints from '../../build/FXPoints';

class FXPointsService {
  constructor(fxPointsContractAddress, provider) {
    this.fxPointsContractAddress = fxPointsContractAddress;
    this.provider = provider;
    this.fxPointsContract = new Contract(this.fxPointsContractAddress, FXPoints.interface, this.provider);
  }

  async getBalance(address) {
    console.log(address)
    let userInfo = await this.fxPointsContract.getPlayerInfoByAddress(address);
    console.log(userInfo[2].toNumber())
    return userInfo[2].toNumber()
  }
}

export default FXPointsService;
