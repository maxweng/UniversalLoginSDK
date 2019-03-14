
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
    let keys = await this.tokenContract.queryKeys(address);
    let balance = await this.tokenContract.calcBalance(address);
    return {
      keys,
      balance
    }
  }

  async getCurrentRoundInfo() {
    let jackpotInfo = await this.tokenContract.getJackpotInfo();
    let airDropPot = await this.tokenContract.getJackpotEth();
    let [, start, roundTime] = jackpotInfo

    return {
      roundTime,
      start,
      airDropPot,
    }
  }
}

export default FXPointsService;