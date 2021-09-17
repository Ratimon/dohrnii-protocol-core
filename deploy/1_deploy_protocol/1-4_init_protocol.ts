import chalk from 'chalk';

// import { promises } from "fs";

// const {
//     readFile,
//     writeFile
//    } = promises;

import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';


import {
    utils,
} from 'ethers';

const { 
    formatUnits,
} = utils;

// import {

// } from '../../typechain';

// import FeiArtifact from "../../artifacts/contracts/token/Fei.sol/Fei.json";
// import TribeArtifact from "../../artifacts/contracts/dao/Tribe.sol/Tribe.json";


  
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const {deployments, getNamedAccounts, network} = hre;
    const {deploy,execute, get, log, read } = deployments;

    const {
        deployer,
    } = await getNamedAccounts();
    
    log(`Deploying contracts with the account: ${deployer}`);
    
    
    const balance = await hre.ethers.provider.getBalance(deployer);
    log(`Account balance: ${formatUnits(balance, 'ether')} BNB`);
    
    
    log(`Network Name: ${network.name}`);
    log("----------------------------------------------------")
    
    const syntheticAddress = (await get('Fei')).address;
    const govAddress = (await get('Tribe')).address;

    await execute(
        'DohrniiCore',
        {from: deployer, log: true}, 
        "init",
        syntheticAddress,
        govAddress
        );

    const syntheticTokenName = 'fei';
    const govTokenName = 'tribe';

    const syntheticTokenAddress = await read(
        'DohrniiCore',
        syntheticTokenName
    )

    const govTokenAddress = await read(
        'DohrniiCore',
        govTokenName
    )

    log('syntheticTokenAddress',chalk.yellow(syntheticTokenAddress));
    log('govTokenAddress',chalk.yellow(govTokenAddress));



  
};
export default func;
func.tags = ["1-4",'init','core'];
func.dependencies = ['1-2','1-2','1-3'];
// module.exports.runAtTheEnd = true;
func.skip = async function (hre: HardhatRuntimeEnvironment) {
    if(hre.network.tags.production || hre.network.tags.staging){
        return true;
    } else{
        return false;
    }
};