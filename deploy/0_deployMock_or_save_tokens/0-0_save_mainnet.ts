import 'dotenv/config';

import chalk from 'chalk';

import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {
  DeployFunction,
  DeploymentSubmission
} from 'hardhat-deploy/types';

// import erc20abi from "../../src/abis/external/erc20.json";
import wethabi from "../../src/abis/external/weth.json";


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
  // if(!hre.network.tags.production) {
    
    const {deployments, getNamedAccounts, network} = hre;
    const {deploy, log ,save } = deployments;
    const {
      deployer,
      weth
    } = await getNamedAccounts();

    log(chalk.cyan(`.....`));
    log(chalk.cyan(`Starting Script.....`));
  
    log(`Saving contracts ....`);
  

    log(`Network Name: ${network.name}`);
    log("----------------------------------------------------")

    const wethSubmission : DeploymentSubmission = {
      abi: wethabi,
      address: weth
    }


    await save('TokenWETH', wethSubmission);

    log(`Deployment Saved: TokenWETH with address ${chalk.green(weth)}`);

    log(chalk.cyan(`Ending Script.....`));
    log(chalk.cyan(`.....`));

  
  // };
}
export default func;
func.tags = ["0-*","save",'token'];

func.skip = async function (hre: HardhatRuntimeEnvironment) {


  //use for mainnet fork test,generate local host, or production

  //1) mainnet fork test    hre.network.name == 'hardhat' && isMainnetForking == true
  //2) generate local host  hre.network.name == 'localhost' && isMainnetForking == true
  //3) production           hre.network.name == 'bscMainnet' && isMainnetForking == false

 //not use for testnet, generate hardhat, unit test
  //1) testnet              hre.network.name == 'bscTestnet' && isMainnetForking == false
  //2) generate hardhat     hre.network.name == 'hardhat' && isMainnetForking == false
  //3) unit test            hre.network.name == 'hardhat' && isMainnetForking == false


  if( (hre.network.name == 'bscTestnet' && !isMainnetForking)
     || (hre.network.name == 'hardhat' && !isMainnetForking) ){
        return true;
    } else{
        return false;
    }


};
