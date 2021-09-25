import chalk from 'chalk';

// Defining bytecode and abi from original contract on mainnet to ensure bytecode matches and it produces the same pair code hash
// const {
//     bytecode,
//     abi,
//   } = require("../deployments/mainnet/UniswapV2Factory.json");

import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';


import {
    ethers,
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

    let wethAddress: string

    let coreAddress: string 
    let syntheticAddress :string 


    let pairAddress: string;

    let pairFeiEthContract : ethers.Contract;
    let token0Contract : ethers.Contract;
    let token1Contract : ethers.Contract;

    const erc20abi = [
        'function name() view returns (string)',
      ]


    const pairabi = [
        'function token0() view returns (address)',
        'function token1() view returns (address)',
      ]


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


    coreAddress = (await get('DohrniiCore')).address;
    syntheticAddress  = (await get('Fei')).address;

   
    pairAddress = await read(
        'UniswapV2Factory',
        'getPair',
        wethAddress,
        syntheticAddress
    )

    /// @param _core Fei Core for reference
    /// @param _pair Uniswap Pair to provide TWAP
    /// @param _duration TWAP duration
    /// @param _isPrice0 flag for using token0 or token1 for cumulative on Uniswap

    const  OracleArgs : {[key: string]: any} = {}; 
    
    OracleArgs[`coreAddress`] = coreAddress;
    OracleArgs[`pairAddress`] = pairAddress;
    OracleArgs[`duration`] = DAY;
    OracleArgs[`isPrice0`] = true;

  
    const UniswapOracleResult = await deploy("Eth-Fei_UniswapOracle", {
        contract: 'UniswapOracle', 
        from: deployer,
        args: Object.values(OracleArgs),
        log: true,
        deterministicDeployment: false,
    });



    if(hre.network.tags.test) {

        await execute(
            'Eth-Fei_UniswapOracle',
            {from: deployer, log: true}, 
            "update"
        );
    
    
        let peg: BigNumber = await read(
            'Eth-Fei_UniswapOracle',
            "read"
        )
    
    
        log(`Price 0 - peg(before): ${chalk.green(peg)}`);

        await advanceTimeAndBlock(2*DAY.toNumber());

        await execute(
            'Eth-Fei_UniswapOracle',
            {from: deployer, log: true}, 
            "update"
        );
    
    
        peg = await read(
            'Eth-Fei_UniswapOracle',
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

        for(var i in OracleArgs){
            log(chalk.yellow( `Argument: ${i} - value: ${OracleArgs[i]}`));
        }

        if(hre.network.tags.production || hre.network.tags.staging){
            await hre.run("verify:verify", {
            address: UniswapOracleResult.address,
            constructorArguments: Object.values(OracleArgs),
            });
        }


        pairFeiEthContract = await hre.ethers.getContractAt(pairabi, pairAddress);


        const token0Address = await pairFeiEthContract.token0();
        const token1Address = await pairFeiEthContract.token1();

        token0Contract = await hre.ethers.getContractAt(erc20abi, token0Address);
        token1Contract = await hre.ethers.getContractAt(erc20abi, token1Address);

        const token0Name = await token0Contract.name()
        const token1Name = await token1Contract.name()


        if(OracleArgs[`isPrice0`]) {
            log(chalk.blue( ` The oracle is represented in ${token1Name} per ${token0Name}`));
        } else {
            log(chalk.blue( ` The oracle is represented in ${token0Name} per ${token1Name}`));

        }

    }
};
export default func;
func.tags = ["3-1","UniswapOracle", "oracle"];
func.dependencies = ['AMM'];

// func.skip = async () => true;