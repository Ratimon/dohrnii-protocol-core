import chalk from 'chalk';

import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

import {
  utils,
} from 'ethers';

const { 
  formatUnits,
  parseUnits
} = utils;

  
  
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  if(!hre.network.tags.production) {
    
    const {deployments, getNamedAccounts, network} = hre;
    const {deploy , log } = deployments;
    const {deployer} = await getNamedAccounts();
  
    log(`Deploying contracts with the account: ${deployer}`);
  
  
    const balance = await hre.ethers.provider.getBalance(deployer);
    log(`Account balance: ${formatUnits(balance, 'ether')} BNB`);
  
  
    log(`Network Name: ${network.name}`);
    log("----------------------------------------------------")
  
    const  WETHArgs : any[] =  [

    ]


    const WETHResult = await deploy("WETH9Mock", {
        contract: "WETH9Mock",
        from: deployer,
        args: WETHArgs,
        log: true,
        skipIfAlreadyDeployed: true
      });
      
    log("------------------ii---------ii---------------------")
    log("----------------------------------------------------")
    log("------------------ii---------ii---------------------")
    log("We may update these following addresses at hardhatconfig.ts ")
    log(`WETH9Mock address: ${chalk.green(WETHResult.address)} at key weth`);
    log("----------------------------------------------------")
  
    if (WETHResult.newlyDeployed) {
      
      log(`weth contract address (WETH9Mock): ${WETHResult.address} at key weth `);

      if(hre.network.tags.production || hre.network.tags.staging){
        await hre.run("verify:verify", {
          address: WETHResult.address,
          constructorArguments: WETHArgs,
        });
      }
      
    }  
  };
}
export default func;
func.tags = ["0-1",'mock'];