require('dotenv').config();
const { PRIVATE_KEY, INFURA_ID, ETHERSCAN_APIKEY } = process.env;
const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
    },
    goerli: {
      provider: () => new HDWalletProvider(PRIVATE_KEY, `https://goerli.infura.io/v3/${INFURA_ID}`),
      network_id: 5,
      gas: 5500000,
      gasPrice: 26976751838,
      // confirmations: 2,
      timeoutBlocks: 200,
      // skipDryRun: true
    },
    ethereum: {
      provider: () => new HDWalletProvider(PRIVATE_KEY, `https://mainnet.infura.io/v3/${INFURA_ID}`),
      network_id: 1,
    },
    mumbai: {
      provider: () => new HDWalletProvider(PRIVATE_KEY, `https://polygon-mumbai.infura.io/v3/${INFURA_ID}`),
      network_id: 80001,
      gas: 5500000,
      gasPrice: 26976751838,
    }
  },
  // Set default mocha options here, use special reporters, etc.
  mocha: {
    // timeout: 100000
  },
  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.17" // Fetch exact version from solc-bin (default: truffle's version)
    }
  },
  plugins: ['truffle-plugin-verify'],
  api_keys: {
    etherscan: ETHERSCAN_APIKEY,
  },
};

