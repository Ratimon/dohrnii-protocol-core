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
    log("----------------------------------------------------");    

    
    const  CoreArgs : {[key: string]: any} = {}; 
    

    const deploymentName = "DohrniiCore"
    const CoreResult = await deploy(deploymentName, {
        contract: 'Core', 
        from: deployer,
        args: Object.values(CoreArgs),
        log: true,
        deterministicDeployment: false
    });

    // const  FeiArgs : any[] =  [
    //     CoreResult.address
    // ];

    // const FeiResult = await deploy('Fei', {
    //     contract: 'Fei', 
    //     from: deployer,
    //     args: FeiArgs,
    //     log: true,
    //     deterministicDeployment: true
    // });


    // const  TribeArgs : any[] =  [
    //     CoreResult.address,
    //     deployer
    // ];

    // const TribeResult = await deploy('Tribe', {
    //     contract: 'Tribe', 
    //     from: deployer,
    //     args: TribeArgs,
    //     log: true,
    //     deterministicDeployment: true
    // });

    log("------------------ii---------ii---------------------")
    log("----------------------------------------------------")
    log("------------------ii---------ii---------------------")
    log(`Could be found at ....`)
    log(chalk.yellow(`/deployment/${network.name}/${deploymentName}.json`))

    
    if (CoreResult.newlyDeployed) {

        log(`Core contract address: ${chalk.green(CoreResult.address)} using ${CoreResult.receipt?.gasUsed} gas`);

        for(var i in CoreArgs){
            log(chalk.yellow( `Argument: ${i} - value: ${CoreArgs[i]}`));
          }

        if(hre.network.tags.production || hre.network.tags.staging){
            await hre.run("verify:verify", {
            address: CoreResult.address,
            constructorArguments: Object.values(CoreArgs),
            });
        }


        // await execute(
        //     'DohrniiCore',
        //     {from: deployer, log: true}, 
        //     "init",
        //     FeiResult.address,
        //     TribeResult.address
        //     );

    }

    log(chalk.cyan(`Ending Script.....`));
    log(chalk.cyan(`.....`));

    
    // if (FeiResult.newlyDeployed) {

    //     log(`Synthetic Token contract address: ${chalk.green(FeiResult.address)} at key synthetic using ${FeiResult.receipt?.gasUsed} gas`);

    //     if(hre.network.tags.production || hre.network.tags.staging){
    //         await hre.run("verify:verify", {
    //         address: FeiResult.address,
    //         constructorArguments: FeiArgs,
    //         });
    //     }

    // }

    // if (TribeResult.newlyDeployed) {

    //     log(`Gov Token contract address: ${chalk.green(TribeResult.address)} at key GovGov using ${TribeResult.receipt?.gasUsed} gas`);

    //     if(hre.network.tags.production || hre.network.tags.staging){
    //         await hre.run("verify:verify", {
    //         address: TribeResult.address,
    //         constructorArguments: TribeArgs,
    //         });
    //     }

    // }

    //////////////

    // const syntheticTokenName = 'fei';
    // const govTokenName = 'tribe';

    // const syntheticTokenAddress = await read(
    //     'DohrniiCore',
    //     syntheticTokenName
    // )

    // const govTokenAddress = await read(
    //     'DohrniiCore',
    //     govTokenName
    // )


    // try {
    //     const syntheticTokenDeployment = {
    //         address: syntheticTokenAddress,
    //         abi: FeiArtifact.abi
    //       }

    //     await writeFile(`./deployments/${network.name}/${syntheticTokenName}.json`, JSON.stringify(syntheticTokenDeployment), 'utf8')
    //     console.log('Synthetic Token Deployments Saved!')


    //     const govTokenDeployment = {
    //         address: govTokenAddress,
    //         abi: TribeArtifact.abi
    //       }

    //     await writeFile(`./deployments/${network.name}/${govTokenName}.json`, JSON.stringify(govTokenDeployment), 'utf8')
    //     console.log('Gov Token Deployments Saved!')

    // } catch(err) {
    //     console.error(err)
    // }

    // const fei = (await get('fei')).address;

    // log( 'fei' , fei )





  
};
export default func;
func.tags = ["1-1",'protocol','core'];
func.dependencies = ['token']
// func.skip = async () => true;
