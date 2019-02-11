
import {utils, Contract} from 'ethers';
import FXPoints from '../../build/FXPoints';

class FXPointsService {
  constructor(tokenContractAddress, provider) {
    this.tokenContractAddress = tokenContractAddress;
    this.provider = provider;
    this.tokenContract = new Contract(this.tokenContractAddress, FXPoints.interface, this.provider);
  }

  async getBalance(address) {
    return await this.tokenContract.balanceOf(address)
  }
}

export default FXPointsService;
