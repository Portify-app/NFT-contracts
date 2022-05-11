require("@nomiclabs/hardhat-waffle");
require('@nomiclabs/hardhat-ethers');
require("@nomiclabs/hardhat-truffle5");
require("@nomiclabs/hardhat-etherscan");
require('hardhat-deploy');


module.exports = {
  namedAccounts: {
    deployer: {
      default: 0
    }
  },
  defaultNetwork: "hardhat",
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: ""
  },
  hardhat: {},
  networks: {
    hardhat: {
      chainId: 1111,
      accounts: {
        count: 50
      }
    },
    testnet: {
      url: "https://rinkeby.infura.io/v3/",
      chainId: 4,
      gasPrice: 3000000000, // 1 gwei
      accounts: [''],
      timeout: 100000
    },
    mainnet: {
      url: "https://mainnet.infura.io/v3/",
      chainId: 1,
      gasPrice: 100000000000, // 100 gwei
      accounts: [''],
      timeout: 1000000
    }
  },
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 10000
      }
    }
  },
};
