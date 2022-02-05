import 'dotenv/config';

import chalk from 'chalk';

import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

import {
  utils,
} from 'ethers';

const { 
  formatUnits,
  parseEther,
  parseUnits
} = utils;

let isMainnetForking: boolean

if (process.env.isMainnetForking == 'true') {
  isMainnetForking  = true;
}


const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    
    const {deployments, getNamedAccounts, network} = hre;
    const {deploy, execute , log } = deployments;
    const {deployer} = await getNamedAccounts();

    log(chalk.cyan(`.....`));
    log(chalk.cyan(`Starting Script.....`));
  
    log(`Deploying contracts with the account: ${deployer}`);
  
  
    const balance = await hre.ethers.provider.getBalance(deployer);
    log(`Account balance: ${formatUnits(balance, 'ether')} BNB`);
  
  
    log(`Network Name: ${network.name}`);
    log("----------------------------------------------------")
  


    const  WETHArgs : {[key: string]: any} = {}; 
    
    WETHArgs[`tokenName`] = "MockWETH";

    const deploymentName = "TokenWETH"

    const WETHResult = await deploy(deploymentName, {
        contract: "MockWeth",
        from: deployer,
        args: Object.values(WETHArgs),
        log: true,
        skipIfAlreadyDeployed: true
      });
      
      log("------------------ii---------ii---------------------")
      log("----------------------------------------------------")
      log("------------------ii---------ii---------------------")
      log(`Could be found at ....`)
      log(chalk.yellow(`/deployment/${network.name}/${deploymentName}.json`))
  
    if (WETHResult.newlyDeployed) {
      
      log(`weth contract address (MockWeth): ${chalk.green(WETHResult.address)} using ${WETHResult.receipt?.gasUsed} gas`);

      for(var i in WETHArgs){
        log(chalk.yellow( `Argument: ${i} - value: ${WETHArgs[i]}`));
      }

      if(hre.network.tags.production || hre.network.tags.staging){
        await hre.run("verify:verify", {
          address: WETHResult.address,
          constructorArguments: Object.values(WETHArgs),
        });
      }
      
    }

    log(chalk.cyan(`Ending Script.....`));
    log(chalk.cyan(`.....`));

}
export default func;
func.tags = ["0-1","weth",'token'];

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