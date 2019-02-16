
import {utils, Contract} from 'ethers';
import FXPoints from '../../abi/FXPoints';

class FXPointsService {
  constructor(fxPointsContractAddress, provider) {
    this.fxPointsContractAddress = fxPointsContractAddress;
    this.provider = provider;
    this.tokenContract = new Contract(this.fxPointsContractAddress, FXPoints.interface, this.provider);
  }

  async getBalance(address) {
    return await this.tokenContract.balanceOf(address)
  }

  async getPlayerInfoByAddress(address) {
    return await this.tokenContract.getPlayerInfoByAddress(address)
  }

  async getCurrentRoundInfo() {
    return await this.tokenContract.getCurrentRoundInfo()
  }
}

export default FXPointsService;