import {Wallet} from 'ethers';

class IdentityService {
  constructor(sdk, emitter, storageService, provider) {
    this.sdk = sdk;
    this.emitter = emitter;
    this.identity = {};
    this.deviceAddress = '';
    this.storageService = storageService;
    this.provider = provider;
  }

  async loadIdentity() {
    const identity = await this.storageService.getIdentity();
    if (identity) {
      this.identity = identity;
      this.emitter.emit('setView', 'MainScreen');
      return true;
    }
    return false;
  }

  async connect() {
    this.privateKey = await this.sdk.connect(this.identity.address);
    const {address} = new Wallet(this.privateKey);
    const filter = {contractAddress: this.identity.address, key: address};
    this.subscription = this.sdk.subscribe('KeyAdded', filter, () => {
      this.onKeyAdded({greetMode: 'addKey'});
    });
  }

  async recover() {
    this.privateKey = await Wallet.createRandom().privateKey;
    const {address} = new Wallet(this.privateKey, this.provider);
    this.deviceAddress = address;
    const filter = {contractAddress: this.identity.address, key: address};
    this.subscription = this.sdk.subscribe('KeyAdded', filter, () => {
      this.onKeyAdded();
    });
  }

  onKeyAdded(viewOptions = {}) {
    this.cancelSubscription();
    this.identity = {
      name: this.identity.name,
      privateKey: this.privateKey,
      address: this.identity.address
    };
    this.emitter.emit('setView', 'Greeting', viewOptions);
    this.storeIdentity(this.identity);
  }

  cancelSubscription() {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
  }

  async storeIdentity(identity) {
    this.storageService.storeIdentity(identity);
  }

  async disconnect() {
    this.storageService.clearStorage();
  }

  async createIdentity(name) {
    this.emitter.emit('creatingIdentity', {name});
    const [privateKey, address] = await this.sdk.create(name);
    this.identity = {
      name,
      privateKey,
      address
    };
    this.emitter.emit('identityCreated', this.identity);
    this.storeIdentity(this.identity);
  }

  async execute(message) {
    await this.sdk.execute(
      message,
      this.identity.privateKey
    );
  }

  async identityExist(identity) {
    const identityAddress = await this.sdk.identityExist(identity);
    if (identityAddress) {
      this.identity = {name: identity, address: identityAddress};
      return true;
    }
  }

  async getFXPInfo() {
    const data = await this.sdk.getFXPInfo();
    return data;
  }

  async getPlayerInfo() {
    const data = await this.sdk.getPlayerInfo(this.identity.address);
    return data;
  }

  async withdraw() {
    
    const data = await this.sdk.withdraw(this.identity.address);
    return data;
  }
}

export default IdentityService;
