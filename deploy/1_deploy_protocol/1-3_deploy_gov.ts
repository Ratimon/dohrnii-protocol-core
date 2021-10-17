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

    const coreAddress = (await get('DohrniiCore')).address;
    

    const  GovArgs : any[] =  [
        coreAddress,
        deployer
    ];

    const GovResult = await deploy('TokenTribe', {
        contract: 'Tribe', 
        from: deployer,
        args: GovArgs,
        log: true,
        deterministicDeployment: false
    });

    log(chalk.yellow("We may update these following addresses at hardhatconfig.ts "));
    log("------------------ii---------ii---------------------")
    log("----------------------------------------------------")
    log("------------------ii---------ii---------------------")


    if (GovResult.newlyDeployed) {

        log(`Gov Token contract address: ${chalk.green(GovResult.address)} at key GovGov using ${GovResult.receipt?.gasUsed} gas`);

        if(hre.network.tags.production || hre.network.tags.staging){
            await hre.run("verify:verify", {
            address: GovResult.address,
            constructorArguments: GovArgs,
            });
        }

        const syntheticAddress = (await get('TokenFEI')).address;
        const govAddress = (await get('TokenTribe')).address;
    
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

    }


  
};
export default func;
func.tags = ["1-3",'gov','core'];
func.dependencies = ['1-1','1-2'];
// func.skip = async () => true;