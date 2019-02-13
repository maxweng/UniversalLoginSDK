// const DevelopmentRelayer = require('./developmentRelayer');
const Relayer = require('fastx-points-relayer').default;

async function startDevelopmentRelayer(configuration, database, wallet) {
  const relayer = new Relayer(configuration, database, wallet.provider);
  relayer.start();
  console.log(`Relayer started on port ${configuration.port}...`);
  return relayer;
}

module.exports = startDevelopmentRelayer;
