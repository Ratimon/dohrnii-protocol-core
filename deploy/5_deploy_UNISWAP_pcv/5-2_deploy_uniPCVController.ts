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
        'constructor()',
        'event Approval(address indexed owner, address indexed spender, uint256 value)',
        'event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)',
        'event Transfer(address indexed from, address indexed to, uint256 value)',
        'function _decimals() view returns (uint8)',
        'function _name() view returns (string)',
        'function _symbol() view returns (string)',
        'function allowance(address owner, address spender) view returns (uint256)',
        'function approve(address spender, uint256 amount) returns (bool)',
        'function balanceOf(address account) view returns (uint256)',
        'function burn(uint256 amount) returns (bool)',
        'function decimals() view returns (uint8)',
        'function decreaseAllowance(address spender, uint256 subtractedValue) returns (bool)',
        'function getOwner() view returns (address)',
        'function increaseAllowance(address spender, uint256 addedValue) returns (bool)',
        'function mint(uint256 amount) returns (bool)',
        'function name() view returns (string)',
        'function owner() view returns (address)',
        'function renounceOwnership()',
        'function symbol() view returns (string)',
        'function totalSupply() view returns (uint256)',
        'function transfer(address recipient, uint256 amount) returns (bool)',
        'function transferFrom(address sender, address recipient, uint256 amount) returns (bool)',
        'function transferOwnership(address newOwner)'
      ]

    const pairabi = [
        'constructor()',
        'event Approval(address indexed owner, address indexed spender, uint256 value)',
        'event Burn(address indexed sender, uint256 amount0, uint256 amount1, address indexed to)',
        'event Mint(address indexed sender, uint256 amount0, uint256 amount1)',
        'event Swap(address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, address indexed to)',
        'event Sync(uint112 reserve0, uint112 reserve1)',
        'event Transfer(address indexed from, address indexed to, uint256 value)',
        'function DOMAIN_SEPARATOR() view returns (bytes32)',
        'function MINIMUM_LIQUIDITY() view returns (uint256)',
        'function PERMIT_TYPEHASH() view returns (bytes32)',
        'function allowance(address, address) view returns (uint256)',
        'function approve(address spender, uint256 value) returns (bool)',
        'function balanceOf(address) view returns (uint256)',
        'function burn(address to) returns (uint256 amount0, uint256 amount1)',
        'function decimals() view returns (uint8)',
        'function factory() view returns (address)',
        'function getReserves() view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)',
        'function initialize(address _token0, address _token1)',
        'function kLast() view returns (uint256)',
        'function mint(address to) returns (uint256 liquidity)',
        'function name() view returns (string)',
        'function nonces(address) view returns (uint256)',
        'function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)',
        'function price0CumulativeLast() view returns (uint256)',
        'function price1CumulativeLast() view returns (uint256)',
        'function skim(address to)',
        'function swap(uint256 amount0Out, uint256 amount1Out, address to, bytes data)',
        'function symbol() view returns (string)',
        'function sync()',
        'function token0() view returns (address)',
        'function token1() view returns (address)',
        'function totalSupply() view returns (uint256)',
        'function transfer(address to, uint256 value) returns (bool)',
        'function transferFrom(address from, address to, uint256 value) returns (bool)'
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

    syntheticAddress = (await get('Fei')).address;
    coreAddress = (await get('DohrniiCore')).address;
    pcvDepositAddress = (await get('UniswapPCVDeposit')).address;
    FeiPerEthOracle = (await get('Eth-Fei_UniswapOracle')).address;
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
        log(chalk.red( `default value of reserve stabilizer is false`));


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