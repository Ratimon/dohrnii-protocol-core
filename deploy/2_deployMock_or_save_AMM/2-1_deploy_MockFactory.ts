import 'dotenv/config';

import chalk from 'chalk';
// Defining bytecode and abi from original contract on mainnet to ensure bytecode matches and it produces the same pair code hash
// const {
//     bytecode,
//     abi,
//   } = require("../deployments/mainnet/UniswapV2Factory.json");

import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {
    DeployFunction,
    DeploymentSubmission
} from 'hardhat-deploy/types';


import {
    utils,
} from 'ethers';

const { 
    formatUnits,
} = utils;

import pairabi from "../../src/abis/external/uni-pair.json";

let isMainnetForking: boolean

if (process.env.isMainnetForking == 'true') {
  isMainnetForking  = true;
}

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

    const {deployments, getNamedAccounts, network} = hre;
    const {deploy,execute, get, log, read, save } = deployments;

    const {
        deployer,
        dev
    } = await getNamedAccounts();
    
    log(`Deploying contracts with the account: ${deployer}`);
    
    
    const balance = await hre.ethers.provider.getBalance(deployer);
    log(`Account balance: ${formatUnits(balance, 'ether')} BNB`);
    
    
    log(`Network Name: ${network.name}`);
    log("----------------------------------------------------");

    let wethAddress: string;
    let syntheticAddress: string;
    let pairAddress: string;


    try {

        wethAddress  = (await get('TokenWETH')).address;
        syntheticAddress  = (await get('TokenFEI')).address;

    } catch  (e) {

        log(chalk.red('Warning: fail trying getting artifacts from deployments, now resusing addresses from hardhat.config.ts'))
        const accounts = await getNamedAccounts();
        wethAddress  = accounts.weth;
        syntheticAddress  = accounts.fei;
    
    }

    const  FactoryArgs : {[key: string]: any} = {}; 
    
    FactoryArgs[`feeToSetter`] = deployer;
  

    const FactoryResult = await deploy("UniswapV2Factory", {
    //   contract: {
    //     abi,
    //     bytecode,
    //   },
        contract: 'UniswapV2Factory', 
        from: deployer,
        args: Object.values(FactoryArgs),
        log: true,
        deterministicDeployment: false,
    });

    log(chalk.yellow("We may update these following addresses at hardhatconfig.ts "));
    log("------------------ii---------ii---------------------")
    log("----------------------------------------------------")
    log("------------------ii---------ii---------------------")


    if (FactoryResult.newlyDeployed) {

        log(`UniswapV2Factory contract address: ${chalk.green(FactoryResult.address)} at key factory using ${FactoryResult.receipt?.gasUsed} gas`);

        for(var i in FactoryArgs){
            log(chalk.yellow( `Argument: ${i} - value: ${FactoryArgs[i]}`));
          }

        if(hre.network.tags.production || hre.network.tags.staging){
            await hre.run("verify:verify", {
            address: FactoryResult.address,
            constructorArguments: Object.values(FactoryArgs),
            });
        }

        await execute(
            'UniswapV2Factory',
            {from: deployer, log: true}, 
            "createPair",
            syntheticAddress,
            wethAddress
            );
    
        pairAddress = await read(
            'UniswapV2Factory',
            'getPair',
            syntheticAddress,
            wethAddress
            
        )

    
        const pairSubmission : DeploymentSubmission = {
            abi: pairabi,
            address: pairAddress
          }
    
        log('pairAddress', pairAddress);
    
        await save('pairWethFei', pairSubmission);
    
    
        log(`The pair has been created at: ${chalk.green(pairAddress)} `);

        const initCodePairHash = await read(
            'UniswapV2Factory',
            'INIT_CODE_PAIR_HASH'
        )
    
        log(`We ${chalk.red(`need to`)} modify initial code hash in ${chalk.yellow(`function pairFor of UniswapV2Library.sol`)} to be the same as :initCodePairHash:`,chalk.green(initCodePairHash));


    }
    // }
};
export default func;
func.tags = ["2-1","factory", "AMM"];
func.dependencies = ['core'];
// func.skip = async () => true;
func.skip = async function (hre: HardhatRuntimeEnvironment) {

  
    //not use for mainnet fork test,generate local host, or production
    
    //1) mainnet fork test    hre.network.name == 'hardhat' && isMainnetForking == true
    //2) generate local host  hre.network.name == 'localhost' && isMainnetForking == true
    //3) production           hre.network.name == 'bscMainnet' && isMainnetForking == false
  
    //use for testnet, generate hardhat, unit test
    //1) testnet              hre.network.name == 'bscTestnet' && isMainnetForking == false
    //2) generate hardhat     hre.network.name == 'hardhat' && isMainnetForking == false
    //3) unit test            hre.network.name == 'hardhat' && isMainnetForking == false
  
  
    if( (hre.network.name == 'hardhat' && isMainnetForking)
       || (hre.network.name == 'localhost' && isMainnetForking) 
       || (hre.network.name == 'bscMainnet' && !isMainnetForking) ){
          return true;
      } else{
          return false;
      }
  
  };