import {utils} from 'ethers';
import Clicker from '../../build/Clicker';
import FXPoints from '../../build/FXPoints';

class ClickService {
  constructor(identityService, addresses, defaultPaymentOptions) {
    this.identityService = identityService;
    this.addresses = addresses;
    this.defaultPaymentOptions = defaultPaymentOptions;
  }

  async click(callback) {
    const message = {
      to: this.addresses.clicker,
      from: this.identityService.identity.address,
      value: 0,
      data: new utils.Interface(Clicker.interface).functions.press.encode([]),
      gasToken: this.addresses.token,
      ...this.defaultPaymentOptions
    };
  
    const message2 = {
      to: this.addresses.fxPoints,
      from: this.identityService.identity.address,
      value: 0,
      data: new utils.Interface(FXPoints.interface).functions.spend.encode([1]),
      gasToken: this.addresses.token,
      ...this.defaultPaymentOptions
    }

    await this.identityService.execute(message);
    await this.identityService.execute(message2);

    callback();
  }
}

export default ClickService;
