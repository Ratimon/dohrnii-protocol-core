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

    log(chalk.cyan(`.....`));
    log(chalk.cyan(`Starting Script.....`));
    
    log(`Deploying contracts with the account: ${deployer}`);
    
    
    const balance = await hre.ethers.provider.getBalance(deployer);
    log(`Account balance: ${formatUnits(balance, 'ether')} BNB`);
    
    
    log(`Network Name: ${network.name}`);
    log("----------------------------------------------------")

    const coreAddress = (await get('DohrniiCore')).address;
    

    // const  GovArgs : any[] =  [
    //     coreAddress,
    //     deployer
    // ];

    const  GovArgs : {[key: string]: any} = {}; 

    GovArgs[`Core address`] = coreAddress;
    GovArgs[`deployer address`] = deployer;


    const deploymentName = "TokenTribe"
    const GovResult = await deploy(deploymentName, {
        contract: 'Tribe', 
        from: deployer,
        args: Object.values(GovArgs),
        log: true,
        deterministicDeployment: false
    });

    log("------------------ii---------ii---------------------")
    log("----------------------------------------------------")
    log("------------------ii---------ii---------------------")
    log(`Could be found at ....`)
    log(chalk.yellow(`/deployment/${network.name}/${deploymentName}.json`))


    if (GovResult.newlyDeployed) {

        log(`Gov Token contract address: ${chalk.green(GovResult.address)}  using ${GovResult.receipt?.gasUsed} gas`);

        for(var i in GovArgs){
            log(chalk.yellow( `Argument: ${i} - value: ${GovArgs[i]}`));
          }

        if(hre.network.tags.production || hre.network.tags.staging){
            await hre.run("verify:verify", {
            address: GovResult.address,
            constructorArguments: Object.values(GovArgs),
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

    log(chalk.cyan(`Ending Script.....`));
    log(chalk.cyan(`.....`));


  
};
export default func;
func.tags = ["1-3",'gov','core'];
func.dependencies = ['1-1','1-2'];
// func.skip = async () => true;