import chalk from 'chalk';

// Defining bytecode and abi from original contract on mainnet to ensure bytecode matches and it produces the same pair code hash
// const {
//     bytecode,
//     abi,
//   } = require("../deployments/mainnet/UniswapV2Factory.json");

import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';


import {
    BigNumber,
    utils,
} from 'ethers';

const { 
    formatUnits,
} = utils;

import { web3 } from "hardhat";

// @ts-ignore
import {BN } from '@openzeppelin/test-helpers'


const wei = web3.utils.toWei;

// const oneEth = new BN(wei("1", "ether"));
// const hunEth = new BN(wei("100", "ether"));
const DAY = BigNumber.from(24 * 60 * 60);

  
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const {deployments, getNamedAccounts, network} = hre;
    const {deploy,execute, get, log, read } = deployments;

    const {
        deployer,
        dev
    } = await getNamedAccounts();
    
    log(`Deploying contracts with the account: ${deployer}`);
    
    
    const balance = await hre.ethers.provider.getBalance(deployer);
    log(`Account balance: ${formatUnits(balance, 'ether')} BNB`);
    
    
    log(`Network Name: ${network.name}`);
    log("----------------------------------------------------");



    const coreAddress = (await get('DohrniiCore')).address;

    let wethAddress: string

    if(hre.network.tags.test || hre.network.tags.staging) {
        try {

            wethAddress  = (await get('MockWeth')).address;

        } catch  (e) {

            log(chalk.red('Warning: fail trying getting artifacts from deployments, now resusing addresses from hardhat.config.ts'))
            const accounts = await getNamedAccounts();
            wethAddress  =  accounts.weth;
        
        }
      }
    else if  (hre.network.tags.production) {
  
          const accounts = await getNamedAccounts();
          wethAddress  =  accounts.weth;
      }
    else {
        throw "Wrong tags";
    }

    const syntheticAddress = (await get('Fei')).address;
    // const getPairArgs : string[] =  [
        
    // ];

    const pairAddress = await read(
        'UniswapV2Factory',
        'getPair',
        wethAddress,
        syntheticAddress
    )

    const  OracleArgs : any[] =  [
        coreAddress,
        pairAddress,
        DAY, //1 day
        true //isPrice0
    ];
  
    const UniswapOracleResult = await deploy("UniswapOracle", {
        contract: 'UniswapOracle', 
        from: deployer,
        args: OracleArgs,
        log: true,
        deterministicDeployment: false,
    });

    log(chalk.yellow("We may update these following addresses at hardhatconfig.ts "));
    log("------------------ii---------ii---------------------")
    log("----------------------------------------------------")
    log("------------------ii---------ii---------------------")


    if (UniswapOracleResult.newlyDeployed) {

        log(`Uniswap Oracle contract address: ${chalk.green(UniswapOracleResult.address)} at key unioracle using ${UniswapOracleResult.receipt?.gasUsed} gas`);

        if(hre.network.tags.production || hre.network.tags.staging){
            await hre.run("verify:verify", {
            address: UniswapOracleResult.address,
            constructorArguments: OracleArgs,
            });
        }

    }
};
export default func;
func.tags = ["3-1","UniswapOracle", "oracle"];
func.dependencies = ['AMM'];

// func.skip = async () => true;