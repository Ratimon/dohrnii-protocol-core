import chalk from 'chalk';
// Defining bytecode and abi from original contract on mainnet to ensure bytecode matches and it produces the same pair code hash
// const {
//     bytecode,
//     abi,
//   } = require("../deployments/mainnet/UniswapV2Factory.json");

import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';


import {
    utils,
} from 'ethers';

const { 
    formatUnits,
} = utils;
  
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const {deployments, getNamedAccounts, network} = hre;
    const {deploy, log, read } = deployments;

    const {
        deployer,
        dev
    } = await getNamedAccounts();
    
    log(`Deploying contracts with the account: ${deployer}`);
    
    
    const balance = await hre.ethers.provider.getBalance(deployer);
    log(`Account balance: ${formatUnits(balance, 'ether')} BNB`);
    
    
    log(`Network Name: ${network.name}`);
    log("----------------------------------------------------");

    const  FactoryArgs : any[] =  [
        dev,
    ];
  
    const FactoryResult = await deploy("UniswapV2Factory", {
    //   contract: {
    //     abi,
    //     bytecode,
    //   },
        contract: 'UniswapV2Factory', 
        from: deployer,
        args: FactoryArgs,
        log: true,
        deterministicDeployment: false,
    });

    log(chalk.yellow("We may update these following addresses at hardhatconfig.ts "));
    log("------------------ii---------ii---------------------")
    log("----------------------------------------------------")
    log("------------------ii---------ii---------------------")


    if (FactoryResult.newlyDeployed) {

        log(`UniswapV2Factory contract address: ${chalk.green(FactoryResult.address)} at key factory using ${FactoryResult.receipt?.gasUsed} gas`);

        if(hre.network.tags.production || hre.network.tags.staging){
            await hre.run("verify:verify", {
            address: FactoryResult.address,
            constructorArguments: FactoryArgs,
            });
        }

        const initCodePairHash = await read(
            'UniswapV2Factory',
            'INIT_CODE_PAIR_HASH'
        )
    
        log(`We may modify initial code hash in  ${chalk.yellow(`function pairFor of UniswapV2Library.sol`)} to be the same as :initCodePairHash:`,chalk.green(initCodePairHash));


    }
};
export default func;
func.tags = ["2-1","factory", "AMM"];
func.dependencies = ['core'];
// func.skip = async () => true;
func.skip = async function (hre: HardhatRuntimeEnvironment) {
    if(hre.network.tags.production){
        return true;
    } else{
        return false;
    }
};