
import {utils, Contract} from 'ethers';
import FXPoints from '../../abi/FXPoints';

class FXPointsService {
  constructor(wallet, fxPointsContractAddress, provider) {
    this.wallet = wallet;
    this.fxPointsContractAddress = fxPointsContractAddress;
    this.provider = provider;
    this.tokenContract = new Contract(this.fxPointsContractAddress, FXPoints.interface, this.wallet);
  }

  async getBalance(address) {
    return await this.tokenContract.queryKeys(address)
  }

  async finishRound(tx, win) {
    let fxPointsContract = this.tokenContract
    let found = false;
    this.provider.once(tx, function(transaction) { 
      transaction.logs.forEach(async function(entry){
        let result = await fxPointsContract.interface.parseLog(entry)
        if(result && result.name === 'LockEthEvent'){
          found = true;
          try {
            let res = await fxPointsContract.finishRound(result.values.ID, win);
            console.log(res)
            return res;
          } catch (error) {
            return error
          }          
        }
      })

      if(!found){
        return new Error('LockEthEvent not found')
      }
      
    });
  }
  async getPlayerInfoByAddress(address) {
    try {
      const keys = await this.tokenContract.queryKeys(address);
      const balance = await this.tokenContract.calcBalance(address);
      const isRunning = await this.tokenContract.getJackpotIsRunning();
      let probability = 0, jackpotEth = 0;
      if(isRunning){
        jackpotEth = await this.tokenContract.getJackpotEth();
        if(jackpotEth && !jackpotEth.eq(0))
        probability = (await this.tokenContract.getJackpotProbabilityOfPlayer(address)).div(100);
      }
    } catch (error) {
      console.log(error)
    }
    
    return {
      keys,
      balance,
      probability
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
      const [roundId, start, roundTime] = jackpotInfo;
    } catch (error) {
      console.log(error)
    }

    return {
      roundId,
      roundTime,
      start,
      airDropPot,
    }
  }
}

export default FXPointsService;