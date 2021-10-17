import 'dotenv/config';

import chalk from 'chalk';

import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';


import {
    BigNumber,
    utils,
} from 'ethers';

const { 
    parseEther,
    formatUnits,
} = utils;

let isMainnetForking: boolean

if (process.env.isMainnetForking == 'true') {
  isMainnetForking  = true;
}

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




    
    let libraryPath

    let wethAddress: string;
    let syntheticAddress: string;

    let factoryAddress: String;

    try {

        libraryPath = "mocks/UniswapV2LibraryMock.sol:UniswapV2Library" 
        wethAddress  = (await get('TokenWETH')).address;
        syntheticAddress  = (await get('TokenFEI')).address;

    } catch  (e) {

        log(chalk.red('Warning: fail trying getting artifacts from deployments, now resusing addresses from hardhat.config.ts'))
        const accounts = await getNamedAccounts();

        libraryPath = "amm/libraries/UniswapV2Library.sol:UniswapV2Library"
        wethAddress  =  accounts.weth;
        syntheticAddress  = accounts.fei;
    
    }



    const LibraryResult = await deploy("UniswapV2Library", {
        contract: `contracts/${libraryPath}`,
        from: deployer,
    });

    factoryAddress = (await get('UniswapV2Factory')).address

    const  RouterArgs : {[key: string]: any} = {}; 
    
    RouterArgs[`factory`] = factoryAddress;
    RouterArgs[`WETH`] = wethAddress;


    const RouterResult = await deploy("UniswapV2Router02", {
        contract: 'UniswapV2Router02', 
        from: deployer,
        args: Object.values(RouterArgs),
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

        for(var i in RouterArgs){
            log(chalk.yellow( `Argument: ${i} - value: ${RouterArgs[i]}`));
          }

        if(hre.network.tags.production || hre.network.tags.staging){
            await hre.run("verify:verify", {
                address: RouterResult.address,
                constructorArguments: Object.values(RouterArgs),
            });
        }

        let ethAmountToAdd : Number = 20;
        let feiAmountToAdd : Number = 5000;
    
        const  approveArgs : any[] =  [
            RouterResult.address,
            BigNumber.from("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
        ];

        const  mintETHArgs : any[] =  [
            deployer,
            parseEther(`${ethAmountToAdd}`)
        ];
    
        const  mintFEIArgs : any[] =  [
            deployer,
            parseEther(`${feiAmountToAdd}`)
        ];
    
        await execute(
            'TokenWETH',
            {from: deployer, log: true}, 
            "mint",
            ...mintETHArgs
        )

        await execute(
            'TokenWETH',
            {from: deployer, log: true}, 
            "approve",
            ...approveArgs
        )

        await execute(
            'DohrniiCore',
            {from: deployer, log: true}, 
            "grantMinter",
            deployer
        );


        await execute(
            'TokenFEI',
            {from: deployer, log: true}, 
            "mint",
            ...mintFEIArgs
        );

        await execute(
            'DohrniiCore',
            {from: deployer, log: true}, 
            "revokeMinter",
            deployer
        );


        await execute(
            'TokenFEI',
            {from: deployer, log: true}, 
            "approve",
            ...approveArgs
        )


        const  addLiquidityArgs : any[] =  [
            wethAddress, // address tokenA,  
            syntheticAddress, // address tokenB,
            parseEther(`${ethAmountToAdd}`),// uint amountADesired
            parseEther(`${feiAmountToAdd}`),//uint amountBDesired 
            parseEther(`${ethAmountToAdd}`).mul(BigNumber.from('99')).div(BigNumber.from('100')), // uint amountAMin
            parseEther(`${feiAmountToAdd}`).mul(BigNumber.from('99')).div(BigNumber.from('100')), //uint amountBMin,
            deployer, // address to,
            Date.now() + 1000 * 60 * 10//uint deadline
        ];
    
    
        
        await execute(
            'UniswapV2Router02',
            {from: deployer, log: true}, 
            "addLiquidity",
            ...addLiquidityArgs
            )        

    }
  
};
export default func;
func.tags = ["2-2",'router','AMM'];
func.dependencies = ['2-1'];
// func.skip = async () => true;
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