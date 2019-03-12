
import {utils, Contract} from 'ethers';
import FXPoints from '../../abi/FXPoints';

class FXPointsService {
  constructor(fxPointsContractAddress, provider) {
    this.fxPointsContractAddress = fxPointsContractAddress;
    this.provider = provider;
    this.tokenContract = new Contract(this.fxPointsContractAddress, FXPoints.interface, this.provider);
  }

  async getBalance(address) {
    return await this.tokenContract.queryKeys(address)
  }

  async getPlayerInfoByAddress(address) {
    const keys = await this.tokenContract.queryKeys(address)
    const balance = await this.tokenContract.calcBalance(address)

    return {
      keys,
      balance
    }
  }

  async getCurrentRoundInfo() {
    let start,roundTime
    let airDropPot = await this.tokenContract.getJackpotEth();

    return {
      roundTime,
      start,
      airDropPot,
    }
  }

  async withdraw(address) {
    return await this.tokenContract.withdraw.sendTransaction({from: address})
  }
}

export default FXPointsService;