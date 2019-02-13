require('dotenv').config();

module.exports = Object.freeze({
  legacyENS: true,
  jsonRpcUrl: process.env.JSON_RPC_URL,
  port: process.env.PORT,
  privateKey: process.env.PRIVATE_KEY,
  chainSpec: {
    ensAddress: process.env.ENS_ADDRESS,
    publicResolverAddress: process.env.PUBLIC_RESOLVER_ADDRESS,
    chainId: 0,
  },
  ensRegistrars: [process.env.ENS_DOMAIN_1],
  tokenContractAddress: process.env.TOKEN_CONTRACT_ADDRESS
});
