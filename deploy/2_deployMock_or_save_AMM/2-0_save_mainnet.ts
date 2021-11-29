import 'dotenv/config';

import chalk from 'chalk';

import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {
  DeployFunction,
  DeploymentSubmission
} from 'hardhat-deploy/types';

import factoryabi from "../../src/abis/external/uni-factory.json";
import pairabi from "../../src/abis/external/uni-pair.json";
import routerabi from "../../src/abis/external/uni-router.json";

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
      uniswapfactory,
      pair_weth_fei,
      uniswaprouter
  } = await getNamedAccounts();

  log(chalk.cyan(`.....`));
  log(chalk.cyan(`Starting Script.....`));

  log(`Saving contracts ....`);

  log(`Network Name: ${network.name}`);
  log("----------------------------------------------------")

  const factorySubmission : DeploymentSubmission = {
    abi: factoryabi,
    address: uniswapfactory
  }

  const pairSubmission : DeploymentSubmission = {
      abi: pairabi,
      address: pair_weth_fei
    }

  const routerSubmission : DeploymentSubmission = {
      abi: routerabi,
      address: uniswaprouter
    }

  await save('UniswapV2Factory', factorySubmission);
  await save('pairWethFei', pairSubmission);
  await save('UniswapV2Router02', routerSubmission);

  log(`Deployment Saved: UniswapV2Factory with address ${chalk.green(uniswapfactory)}`);
  log(`Deployment Saved: pairEthFei with address ${chalk.green(pair_weth_fei)}`);
  log(`Deployment Saved: UniswapV2Router02 with address ${chalk.green(routerSubmission)}`);

  log(chalk.cyan(`Ending Script.....`));
  log(chalk.cyan(`.....`));
    

  
  // };
}
export default func;
func.tags = ["2-0","save",'AMM'];
func.dependencies = ['core'];

// func.skip = async () => true;

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
