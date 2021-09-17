import chalk from 'chalk';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';


import {
    BigNumber,
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
    log("----------------------------------------------------");


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


    let coreAddress = (await get('DohrniiCore')).address;
    let pairAddress =  await read(
        'UniswapV2Factory',
        'getPair',
        syntheticAddress,
        wethAddress
        
    )
    let routerAddress = (await get('UniswapV2Router02')).address;
    let FeiPerEthOracle = (await get('FeiPerEthUniswapOracle')).address;

        
    /// @param _core Fei Core for reference
    /// @param _pair Uniswap Pair to deposit to
    /// @param _router Uniswap Router
    /// @param _oracle oracle for reference
    /// @param _backupOracle the backup oracle to reference
    /// @param _maxBasisPointsFromPegLP the max basis points of slippage from peg allowed on LP deposit

    const  PCVDepositArgs : any[] =  [
        coreAddress, 
        pairAddress,
        routerAddress,
        //TODO: consider using chainlinkEthUsdOracleWrapperAddress
        FeiPerEthOracle, //    address _oracle,
        FeiPerEthOracle,  //   address _backupOracle,
        100, //     

    ];

  
    const PCVDepositResult = await deploy("UniswapPCVDeposit", {
        contract: 'UniswapPCVDeposit', 
        from: deployer,
        args: PCVDepositArgs,
        log: true,
        deterministicDeployment: false,
    });

    log(chalk.yellow("We may update these following addresses at hardhatconfig.ts "));
    log("------------------ii---------ii---------------------")
    log("----------------------------------------------------")
    log("------------------ii---------ii---------------------")


    if (PCVDepositResult.newlyDeployed) {

        log(`uni-pc-deposit contract address: ${chalk.green(PCVDepositResult.address)} at key uni-pc-deposit using ${PCVDepositResult.receipt?.gasUsed} gas`);

        if(hre.network.tags.production || hre.network.tags.staging){
            await hre.run("verify:verify", {
            address: PCVDepositResult.address,
            constructorArguments: PCVDepositArgs,
            });
        }


    }
};
export default func;
func.tags = ["5-1","uni-deposit", "pcv"];
func.dependencies = ['middleware'];
// func.skip = async () => true;