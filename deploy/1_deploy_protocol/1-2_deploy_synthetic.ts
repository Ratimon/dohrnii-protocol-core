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

    // const  SyntheticArgs : any[] =  [
    //     coreAddress
    // ];

    const  SyntheticArgs : {[key: string]: any} = {}; 

    SyntheticArgs[`Core address`] = coreAddress;


    const deploymentName = "TokenFEI"
    const SyntheticResult = await deploy(deploymentName, {
        contract: 'Fei', 
        from: deployer,
        args: Object.values(SyntheticArgs),
        log: true,
        deterministicDeployment: false
    });



    log("------------------ii---------ii---------------------")
    log("----------------------------------------------------")
    log("------------------ii---------ii---------------------")
    log(`Could be found at ....`)
    log(chalk.yellow(`/deployment/${network.name}/${deploymentName}.json`))


    
    if (SyntheticResult.newlyDeployed) {

        log(`Synthetic Token contract address: ${chalk.green(SyntheticResult.address)}  using ${SyntheticResult.receipt?.gasUsed} gas`);

        for(var i in SyntheticArgs){
            log(chalk.yellow( `Argument: ${i} - value: ${SyntheticArgs[i]}`));
          }

        if(hre.network.tags.production || hre.network.tags.staging){
            await hre.run("verify:verify", {
            address: SyntheticResult.address,
            constructorArguments: Object.values(SyntheticArgs),
            });
        }

    }

    log(chalk.cyan(`Ending Script.....`));
    log(chalk.cyan(`.....`));




  
};
export default func;
func.tags = ["1-2",'synthetic', 'core'];
func.dependencies = ['1-1']

// func.skip = async () => true;