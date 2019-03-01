import fs from 'fs';
import {providers, Wallet} from 'ethers';
import {defaultAccounts} from 'ethereum-waffle';
import ENSBuilder from 'ens-builder';


class ENSDeployer {
  constructor(provider, deployerPrivateKey) {
    this.provider = provider;
    this.deployerPrivateKey = deployerPrivateKey;
    this.deployer = new Wallet(deployerPrivateKey, provider);
    this.variables = {};
    this.count = 1;
  }

  save(filename) {
    const content = Object.entries(this.variables)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    fs.writeFile(filename, content, (err) => {
      if (err) {
        return console.error(err);
      }
      console.log(`${filename} file updated.`);
    });
  }

  async deployRegistrars(registrars, tld = 'eth') {
    const builder = new ENSBuilder(this.deployer);
    await builder.bootstrap();
    this.variables.ENS_ADDRESS = builder.ens.address;
    this.variables.PUBLIC_RESOLVER_ADDRESS = builder.resolver.address;
    console.log(this.variables)

    console.log('registerTLD')
    await builder.registerTLD(tld);

    console.log('registerReverseRegistrar')
    await builder.registerReverseRegistrar();

    for (let count = 0; count < registrars.length; count++) {
      const domain = registrars[count];
      const [label, tld] = domain.split('.');

      console.log('registerDomain')
      await builder.registerDomain(label, tld);

      this.count += 1;
    }
  }

  static async deploy(jsonRpcUrl, deployKey, registrars, tld = 'eth') {
    const provider = new providers.JsonRpcProvider(jsonRpcUrl);
    const deployerPrivateKey = deployKey ? deployKey : defaultAccounts[defaultAccounts.length - 1].secretKey;
    const deployer = new ENSDeployer(provider, deployerPrivateKey);
    await deployer.deployRegistrars(registrars, tld);
    console.log(deployer.variables)
    //deployer.save('.env');
  }
}

export default ENSDeployer;
