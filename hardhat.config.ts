// import { config as dotenvConfig } from "dotenv";
import 'dotenv/config';
import {HardhatUserConfig} from 'hardhat/types';
// import { NetworkUserConfig } from "hardhat/types";

import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-web3";
import 'hardhat-deploy-ethers';
import '@nomiclabs/hardhat-waffle';
import "hardhat-typechain";
import "hardhat-contract-sizer";
import 'hardhat-deploy';
import "solidity-coverage"
import 'hardhat-tracer';
import "hardhat-log-remover"
import "hardhat-storage-layout"
import "@tenderly/hardhat-tenderly"

// import CONFIG from './deploy-artifacts/config.json' // import config file


import tasks from './tasks'
for (const tsk of tasks) { tsk() }


const PRIVATE_KEY = process.env.PKEY;
const PRIVATE_KEY_2 = process.env.PKEY2;
const MNEMONIC = process.env.MKEY;
const ETHERSCAN_KEY = process.env.ETHERSCANKEY;

const NODEUSERNAME = process.env.CHAINSTACK_NODEUSERNAME;
const PASSWORD= process.env.CHAINSTACK_PASSWORD;
const RPC_ENDPOINT= process.env.CHAINSTACK_RPC_ENDPOINT;
// const WWS_ENDPOINT= process.env.CHAINSTACK_WSS_ENDPOINT;


const config: HardhatUserConfig = {
  namedAccounts: {
    deployer: 0,
    dev: 1,

    zero: "0x0000000000000000000000000000000000000000",
     ///-------------------/deploy---tokens-------------------///

    busd: {
      31337: "0xd5864478983F7fdA66239D2B85FA7CF75a4B71f9", 
      56: "0xe9e7cea3dedca5984780bafc599bd69add087d56", //Mapped from  https://bscscan.com/address/0xe9e7cea3dedca5984780bafc599bd69add087d56
      97: "0x2a7b39f35fA3e0bFBFD0136E43Cb9c7feb6625Cc",
    },

    weth: {
      31337: "0xC9F4AC0f1998223b9a9726e6EbF3F5043433DD33", 
      56: "0x2170ed0880ac9a755fd29b2688956bd959f933f8", //TODO
      97: "0xA3234ceaaf5877239738a71B1ea24b86f8EF7D5C",
    },

    usdt: {
      31337: "0x2865941758E4530407B09920c51Cce5e0EA9B7bD", 
      56: "0x55d398326f99059ff775485246999027b3197955", //TODO
      97: "0xd8f40b596bf1a519478888443be550f65c2ca42e",
    },

    wbnb: {
      31337: "0x63C628733E650d813D2511b7c34695e1eD496361", // Mapped from  WBASE Contract
      56: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", //TODO
      97: "0xEDCC8D4604691CdA5461b9fB42053005Da511588",
    },




  },

  networks: {

    hardhat: {
      chainId: 31337,
      forking: {
        url: `https://${NODEUSERNAME}:${PASSWORD}@${RPC_ENDPOINT}`, //https://USERNAME:PASSWORD@RPC_ENDPOINT
        blockNumber: 9801242,
        enabled: false
        // enabled: true

      },
      // mining: {
      //   auto: false,
      //   interval: 1000
      // },
      accounts: {
        count: 10,
        initialIndex: 0,
        mnemonic: `${MNEMONIC}`,
        path: "m/44'/60'/0'/0",
      },
        throwOnTransactionFailures: true,
        // if true,  throw stack traces on transaction failures.
        // If false, return  failing transaction hash.
        throwOnCallFailures: true,
        // If is true, will throw  stack traces when a call fails.
        // If false, will return the call's return data, which can contain a revert reason
        live: false,
        tags: ["test"]
    },

    // rinkeby: {
    //   url: INFURA_URL,
    //   accounts: [`0x${PRIVATE_KEY}`]
    // },

    bscTestnet: {
      url: "https://data-seed-prebsc-1-s3.binance.org:8545/",
      // url: "https://data-seed-prebsc-1-s2.binance.org:8545/",
      chainId: 97,
      gasPrice: 10000000000,
      // accounts: [`0x${PRIVATE_KEY}`]
      accounts: {
        count: 10,
        initialIndex: 0,
        mnemonic: `${MNEMONIC}`,
        path: "m/44'/60'/0'/0",
      },

      tags: ["staging"]

    },


    bscMainnet: {
      url: "https://bsc-dataseed.binance.org/",
      chainId: 56,
      gasPrice: 5000000000,

      accounts: {
        count: 10,
        initialIndex: 0,
        mnemonic: `${MNEMONIC}`,
        path: "m/44'/60'/0'/0",
      },

      tags: ['production'],

      throwOnTransactionFailures: false,
      // if true,  throw stack traces on transaction failures.
      // If false, return  failing transaction hash.
      throwOnCallFailures: true,
      // If is true, will throw  stack traces when a call fails.
      // If false, will return the call's return data, which can contain a revert reason
    }

    // bscMainnet: {
    //   url: "https://bsc-dataseed.binance.org/",
    //   chainId: 56,
    //   gasPrice: 20000000000,
    //   accounts: [`0x${PRIVATE_KEY_2}`]
    // }

  },

  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: ETHERSCAN_KEY  //bsctestnet
  },

  solidity: {

    compilers: [
      // {
      //   version: "0.5.17",
      //   settings: {
      //     optimizer: {
      //       enabled: true,
      //       runs: 100
      //     },
      //     outputSelection: {
      //       "*": {
      //           "*": ["storageLayout"],
      //       },
      //     },
      //   }
      // },
      // {
      //   version: "0.4.0",
      //   settings: {
      //     optimizer: {
      //       enabled: true,
      //       runs: 200
      //     }
      //   }
      // },
      {
        version: "0.6.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.8.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.8.4",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
      
    ],


  },

  paths: {
    sources: './contracts',
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
    deploy: './deploy',
    deployments: './deployments',
    imports: './imports'
  },

  typechain: {
    outDir: 'typechain',
    target: 'ethers-v5',
  },

  mocha: {
    timeout: 300000
  },
  
  
  
};

export default config;