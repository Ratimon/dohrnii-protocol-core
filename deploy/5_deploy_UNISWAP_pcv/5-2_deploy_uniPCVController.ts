import chalk from 'chalk';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';


import {
    BigNumber,
    ethers,
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


    let wethAddress: string;

    let coreAddress: string;
    let syntheticAddress : string;

    let FeiPerEthOracle: string;
    let pcvDepositAddress: string;

    let pairAddress : string;

    let pairFeiEthContract : ethers.Contract;
    let syntheticTokenContract : ethers.Contract;
    let wethTokenContract : ethers.Contract;

    const erc20abi = [
        'function name() view returns (string)',
      ]


    const pairabi = [
        'function token0() view returns (address)',
        'function token1() view returns (address)',
      ]

    try {
        wethAddress  = (await get('TokenWETH')).address;
    } catch  (e) {
        log(chalk.red('Warning: fail trying getting artifacts from deployments, now resusing addresses from hardhat.config.ts'))
        const accounts = await getNamedAccounts();
        wethAddress  =  accounts.weth;
    }


    syntheticAddress = (await get('TokenFEI')).address;
    coreAddress = (await get('DohrniiCore')).address;
    pcvDepositAddress = (await get('UniswapPCVDeposit')).address;
    FeiPerEthOracle = (await get('WETH_FEI_UniswapOracle')).address;
    pairAddress =  await read(
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


        pairFeiEthContract = await hre.ethers.getContractAt(pairabi, pairAddress);


        const token0Address = await pairFeiEthContract.token0();
        const token1Address = await pairFeiEthContract.token1();

        syntheticTokenContract = await hre.ethers.getContractAt(erc20abi, syntheticAddress);
        wethTokenContract = await hre.ethers.getContractAt(erc20abi, wethAddress);

        const syntheticTokenName = await syntheticTokenContract.name();
        const wethTokenName = await wethTokenContract.name();


        let currentDoInvert = await read(
            'UniswapPCVController',
            'doInvert'
        )


        console.log('doInvert: Before', chalk.green(`${currentDoInvert}`));

        // true && token0 = syntheticAddress => FEI / ETH 
        // true && token1 = syntheticAddress => ETH / FEI  fix to  FEI / ETH
        // false && token0 = ETH => FEI / ETH   nofix 
        // false && token1 = ETH => ETH / FEI  fix to  FEI / ETH
        log(chalk.red( `default value of PCV controller's currentDoInvert is false`));


        // set oracle to be : FEI per ETH
        if((currentDoInvert && (token1Address == syntheticAddress))
            || (!currentDoInvert && (token1Address == wethAddress)) ) {
            log(chalk.blue( `The oracle is represented in ${wethTokenName} per ${syntheticTokenName}`));

            let readOracle =  await read(
                'UniswapPCVController',
                "readOracle",
            )

            console.log('readOracle: Before invert', chalk.green(`${readOracle}`));


            log(`.. Fixing .. by inverting`);


            await execute(
                'UniswapPCVController',
                {from: deployer, log: true}, 
                "setDoInvert",
                !currentDoInvert
            );

            currentDoInvert = await read(
                'UniswapPCVController',
                'doInvert'
            )

            console.log('doInvert: After invert', chalk.green(`${currentDoInvert}`));


            readOracle =  await read(
                'UniswapPCVController',
                "readOracle",
            )

            console.log('readOracle: After invert', chalk.green(`${readOracle}`));

            log(chalk.blue( `The oracle is fixed to ${syntheticTokenName} per ${wethTokenName}`));


        } else {
            log(chalk.blue( `The oracle is already represented in ${syntheticTokenName} per ${wethTokenName}`));
            log(`Nothing to fix`);

        }


    }
};
export default func;
func.tags = ["5-2","uni-controller", "pcv-uni"];
func.dependencies = ['5-1'];
// func.skip = async () => true;