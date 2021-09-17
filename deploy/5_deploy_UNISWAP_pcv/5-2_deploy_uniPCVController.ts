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
    let pcvDepositAddress = (await get('UniswapPCVDeposit')).address;
    let FeiPerEthOracle = (await get('FeiPerEthUniswapOracle')).address;
    let pairAddress =  await read(
        'UniswapV2Factory',
        'getPair',
        syntheticAddress,
        wethAddress
        
    )
    

        
    /// @notice UniswapPCVController constructor
    /// @param _core Fei Core for reference
    /// @param _pcvDeposit PCV Deposit to reweight
    /// @param _oracle oracle for reference
    /// @param _backupOracle the backup oracle to reference
    /// @param _incentiveAmount amount of FEI for triggering a reweight
    /// @param _minDistanceForReweightBPs minimum distance from peg to reweight in basis points
    /// @param _pair Uniswap pair contract to reweight
    /// @param _reweightFrequency the frequency between reweights

    const  PCVControllerArgs : any[] =  [
        coreAddress, 
        pcvDepositAddress,
        //TODO: consider using chainlinkEthUsdOracleWrapperAddress
        FeiPerEthOracle, //    address _oracle,
        FeiPerEthOracle,  //   address _backupOracle,
        200,
        500,
        pairAddress,
        14400  //  every 4 hours     uint256 _frequency 
    ];

  
    const PCVControllerResult = await deploy("UniswapPCVController", {
        contract: 'UniswapPCVController', 
        from: deployer,
        args: PCVControllerArgs,
        log: true,
        deterministicDeployment: false,
    });

    log(chalk.yellow("We may update these following addresses at hardhatconfig.ts "));
    log("------------------ii---------ii---------------------")
    log("----------------------------------------------------")
    log("------------------ii---------ii---------------------")


    if (PCVControllerResult.newlyDeployed) {

        log(`uni-pcv-controller contract address: ${chalk.green(PCVControllerResult.address)} at key uni-pcv-controller using ${PCVControllerResult.receipt?.gasUsed} gas`);

        if(hre.network.tags.production || hre.network.tags.staging){
            await hre.run("verify:verify", {
            address: PCVControllerResult.address,
            constructorArguments: PCVControllerArgs,
            });
        }


    }
};
export default func;
func.tags = ["5-2","uni-controller", "pcv"];
func.dependencies = ['5-1'];
// func.skip = async () => true;