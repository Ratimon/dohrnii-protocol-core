import chalk from 'chalk';

// Defining bytecode and abi from original contract on mainnet to ensure bytecode matches and it produces the same pair code hash
// const {
//     bytecode,
//     abi,
//   } = require("../deployments/mainnet/UniswapV2Factory.json");

import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';


import {
    BigNumber,
    utils,
} from 'ethers';

const { 
    formatUnits,
} = utils;

import {
    advanceTimeAndBlock
} from "../../utils";


const DAY = BigNumber.from(24 * 60 * 60);

  
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const {deployments, getNamedAccounts, network} = hre;
    const {deploy,execute, get, log, read } = deployments;

    const {
        deployer,
        dev
    } = await getNamedAccounts();
    
    log(`Deploying contracts with the account: ${deployer}`);
    
    
    const balance = await hre.ethers.provider.getBalance(deployer);
    log(`Account balance: ${formatUnits(balance, 'ether')} BNB`);
    
    
    log(`Network Name: ${network.name}`);
    log("----------------------------------------------------");



    let coreAddress = (await get('DohrniiCore')).address;
    let wethAddress: string

    if(hre.network.tags.test || hre.network.tags.staging) {
        try {
            wethAddress  = (await get('MockWeth')).address;
        } catch  (e) {
            log(chalk.red('Warning: fail trying getting artifacts from deployments, now resusing addresses from hardhat.config.ts'))
            const accounts = await getNamedAccounts();
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

    const syntheticAddress = (await get('Fei')).address;

    const pairAddress = await read(
        'UniswapV2Factory',
        'getPair',
        wethAddress,
        syntheticAddress
    )

    /// @param _core Fei Core for reference
    /// @param _pair Uniswap Pair to provide TWAP
    /// @param _duration TWAP duration
    /// @param _isPrice0 flag for using token0 or token1 for cumulative on Uniswap
    const  OracleArgs : any[] =  [
        coreAddress,
        pairAddress,
        DAY, //1 day
        true //isPrice0
    ];
  
    const UniswapOracleResult = await deploy("FeiPerEthUniswapOracle", {
        contract: 'UniswapOracle', 
        from: deployer,
        args: OracleArgs,
        log: true,
        deterministicDeployment: false,
    });



    if(hre.network.tags.test) {

        await execute(
            'FeiPerEthUniswapOracle',
            {from: deployer, log: true}, 
            "update"
        );
    
    
        let peg: BigNumber = await read(
            'FeiPerEthUniswapOracle',
            "read"
        )
    
    
        log(`Price 0 - peg(before): ${chalk.green(peg)}`);

        await advanceTimeAndBlock(2*DAY.toNumber());

        await execute(
            'FeiPerEthUniswapOracle',
            {from: deployer, log: true}, 
            "update"
        );
    
    
        peg = await read(
            'FeiPerEthUniswapOracle',
            "read"
        )
    
    
        log(`Price 0 - peg(After): ${chalk.green(peg)}`);
    }

   




    log(chalk.yellow("We may update these following addresses at hardhatconfig.ts "));
    log("------------------ii---------ii---------------------")
    log("----------------------------------------------------")
    log("------------------ii---------ii---------------------")




    if (UniswapOracleResult.newlyDeployed) {

        log(`Uniswap Oracle contract address: ${chalk.green(UniswapOracleResult.address)} at key unioracle using ${UniswapOracleResult.receipt?.gasUsed} gas`);

        if(hre.network.tags.production || hre.network.tags.staging){
            await hre.run("verify:verify", {
            address: UniswapOracleResult.address,
            constructorArguments: OracleArgs,
            });
        }

    }
};
export default func;
func.tags = ["3-1","UniswapOracle", "oracle"];
func.dependencies = ['AMM'];

// func.skip = async () => true;