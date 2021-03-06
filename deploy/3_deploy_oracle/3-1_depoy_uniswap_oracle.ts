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
        dev,
        // pancakepair
    } = await getNamedAccounts();

    log(chalk.cyan(`.....`));
    log(chalk.cyan(`Starting Script.....`));
    
    log(`Deploying contracts with the account: ${deployer}`);
    
    
    const balance = await hre.ethers.provider.getBalance(deployer);
    log(`Account balance: ${formatUnits(balance, 'ether')} BNB`);
    
    
    log(`Network Name: ${network.name}`);
    log("----------------------------------------------------");

    let wethAddress: string;

    let coreAddress: string 
    let syntheticAddress: string;

    let pairAddress: string
    let factoryAddress: string

    let uniFactoryContract: ethers.Contract;
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



    try {
        wethAddress = (await get('TokenWETH')).address;
        syntheticAddress= (await get('TokenFEI')).address;
        pairAddress = (await get('pairWethFei')).address;
    } catch  (e) {

        log(chalk.red('Warning: fail trying getting artifacts from deployments, now resusing addresses from hardhat.config.ts'))
        const accounts = await getNamedAccounts();
        wethAddress = accounts.weth;
        syntheticAddress= accounts.fei;
        pairAddress  = accounts.pair_weth_fei;
    }

    pairFeiEthContract = await hre.ethers.getContractAt(pairabi, pairAddress);


    coreAddress = (await get('DohrniiCore')).address;

    /// @param _core Fei Core for reference
    /// @notice UniswapOracle constructor
    /// @param _pair Uniswap Pair to provide TWAP
    /// @param _duration TWAP duration
    /// @param _isPrice0 flag for using token0 or token1 for cumulative on Uniswap
    const  OracleArgs : {[key: string]: any} = {};
    
    OracleArgs[`coreAddress`] = coreAddress;
    OracleArgs[`pairAddress`] = pairAddress;
    OracleArgs[`duration`] = DAY;
    OracleArgs[`isPrice0`] = true;


    const deploymentName = "WETH_FEI_UniswapOracle"
    const UniswapOracleResult = await deploy(deploymentName, {
        contract: 'UniswapOracle', 
        from: deployer,
        args: Object.values(OracleArgs),
        log: true,
        deterministicDeployment: false,
    });



    // if(hre.network.tags.test) {

    await execute(
        'WETH_FEI_UniswapOracle',
        {from: deployer, log: true}, 
        "update"
    );

    let peg: BigNumber = await read(
        'WETH_FEI_UniswapOracle',
        "read"
    )


    log(`Price 0 - peg(before): ${chalk.green(peg)}`);

    if(!hre.network.tags.production && !hre.network.tags.staging){
        await advanceTimeAndBlock(2*DAY.toNumber());
    }


    await execute(
        'WETH_FEI_UniswapOracle',
        {from: deployer, log: true}, 
        "update"
    );


    peg = await read(
        'WETH_FEI_UniswapOracle',
        "read"
    )


    log(`Price 0 - peg(After): ${chalk.green(peg)}`);


    log("------------------ii---------ii---------------------")
    log("----------------------------------------------------")
    log("------------------ii---------ii---------------------")
    log(`Could be found at ....`)
    log(chalk.yellow(`/deployment/${network.name}/${deploymentName}.json`))



    if (UniswapOracleResult.newlyDeployed) {

        log(`Uniswap Oracle contract address: ${chalk.green(UniswapOracleResult.address)} using ${UniswapOracleResult.receipt?.gasUsed} gas`);

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

    log(chalk.cyan(`Ending Script.....`));
    log(chalk.cyan(`.....`));
};
export default func;
func.tags = ["3-1","UniswapOracle", "oracle"];
func.dependencies = ['AMM'];