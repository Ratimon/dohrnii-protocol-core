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

    const  SyntheticArgs : any[] =  [
        coreAddress
    ];

    const SyntheticResult = await deploy('TokenFEI', {
        contract: 'Fei', 
        from: deployer,
        args: SyntheticArgs,
        log: true,
        deterministicDeployment: false
    });



    log(chalk.yellow("We may update these following addresses at hardhatconfig.ts "));
    log("------------------ii---------ii---------------------")
    log("----------------------------------------------------")
    log("------------------ii---------ii---------------------")


    
    if (SyntheticResult.newlyDeployed) {

        log(`Synthetic Token contract address: ${chalk.green(SyntheticResult.address)} at key synthetic using ${SyntheticResult.receipt?.gasUsed} gas`);

        if(hre.network.tags.production || hre.network.tags.staging){
            await hre.run("verify:verify", {
            address: SyntheticResult.address,
            constructorArguments: SyntheticArgs,
            });
        }

    }




  
};
export default func;
func.tags = ["1-2",'synthetic', 'core'];
func.dependencies = ['1-1']

// func.skip = async () => true;