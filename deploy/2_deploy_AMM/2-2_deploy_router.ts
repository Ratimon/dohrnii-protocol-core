import chalk from 'chalk';


import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';


import {
    utils,
} from 'ethers';

const { 
    formatUnits,
} = utils;


  
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const {deployments, getNamedAccounts, network} = hre;
    const {deploy, execute, get, log, read } = deployments;

    const {
        deployer,
        dev
    } = await getNamedAccounts();
    
    log(`Deploying contracts with the account: ${deployer}`);
    
    
    const balance = await hre.ethers.provider.getBalance(deployer);
    log(`Account balance: ${formatUnits(balance, 'ether')} BNB`);
    
    
    log(`Network Name: ${network.name}`);
    log("----------------------------------------------------")
    
    const factoryAddress = (await get('UniswapV2Factory')).address
    let libraryPath
    let wethAddress: string

    if(hre.network.tags.test || hre.network.tags.staging) {
        try {


            libraryPath = "mocks/UniswapV2LibraryMock.sol:UniswapV2Library" 
            wethAddress  = (await get('WETH9Mock')).address;

        } catch  (e) {

            log(chalk.red('Warning: fail trying getting artifacts from deployments, now resusing addresses from hardhat.config.ts'))
            const accounts = await getNamedAccounts();

            libraryPath = "amm/libraries/UniswapV2Library.sol:UniswapV2Library"
            wethAddress  =  accounts.weth;
        
        }
      }
    else if  (hre.network.tags.production) {
  
        const accounts = await getNamedAccounts();
        wethAddress  =  accounts.weth;
    }
    else {
        throw "Wrong tags";
    }


    const LibraryResult = await deploy("UniswapV2Library", {
        contract: `contracts/${libraryPath}`,
        from: deployer,
    });

    const  RouterArgs : any[] =  [
        factoryAddress,
        wethAddress
    ];


    const RouterResult = await deploy("UniswapV2Router02", {
        contract: 'UniswapV2Router02', 
        from: deployer,
        args: RouterArgs,
        log: true,
        deterministicDeployment: false,
        libraries: {
            UniswapV2Library: LibraryResult.address
        }
    });


    log(chalk.yellow("We may update these following addresses at hardhatconfig.ts "));
    log("------------------ii---------ii---------------------")
    log("----------------------------------------------------")
    log("------------------ii---------ii---------------------")


    if (RouterResult.newlyDeployed) {

        log(`Router contract address: ${chalk.green(RouterResult.address)} at key router using ${RouterResult.receipt?.gasUsed} gas`);

        if(hre.network.tags.production || hre.network.tags.staging){
            await hre.run("verify:verify", {
            address: RouterResult.address,
            constructorArguments: RouterArgs,
            });
        }

    }
  
};
export default func;
func.tags = ["2-2",'router','AMM'];
func.dependencies = ['2-1'];
// func.skip = async () => true;