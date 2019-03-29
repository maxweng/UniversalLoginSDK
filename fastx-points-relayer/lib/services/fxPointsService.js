
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
    try {
      const keys = await this.tokenContract.queryKeys(address);
      const balance = await this.tokenContract.calcBalance(address);
      const isRunning = await this.tokenContract.getJackpotIsRunning();
      const jackpotEth = await this.tokenContract.getJackpotEth();
      let probability = 0;
      if(isRunning && !jackpotEth.eq(0)){
        probability = await this.tokenContract.getJackpotProbabilityOfPlayer(address);
      }
    } catch (error) {
      console.log(error)
    }
    
    return {
      keys,
      balance,
      probability: probability.div(100)
    }
  }

  async getCurrentRoundInfo() {
    try {
      const isRunning = await this.tokenContract.getJackpotIsRunning();
      let jackpotInfo = [
        null,
        utils.bigNumberify('0'),
        utils.bigNumberify('0')
      ]
      let airDropPot = utils.bigNumberify('0')
      if(isRunning){
        jackpotInfo = await this.tokenContract.getJackpotInfo();
        airDropPot = await this.tokenContract.getJackpotEth();
      }
      const [, start, roundTime] = jackpotInfo;
    } catch (error) {
      console.log(error)
    }

    return {
      roundTime,
      start,
      airDropPot,
    }
  }
}

export default FXPointsService;