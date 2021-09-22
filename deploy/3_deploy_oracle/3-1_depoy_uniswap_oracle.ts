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
    let oracleContract: ethers.Contract;


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

      const oraclerefabi = [
        'event BackupOracleUpdate(address indexed oldBackupOracle, address indexed newBackupOracle)',
        'event ContractAdminRoleUpdate(bytes32 indexed oldContractAdminRole, bytes32 indexed newContractAdminRole)',
        'event CoreUpdate(address indexed oldCore, address indexed newCore)',
        'event DecimalsNormalizerUpdate(int256 oldDecimalsNormalizer, int256 newDecimalsNormalizer)',
        'event InvertUpdate(bool oldDoInvert, bool newDoInvert)',
        'event OracleUpdate(address indexed oldOracle, address indexed newOracle)',
        'event Paused(address account)',
        'event Unpaused(address account)',
        'function CONTRACT_ADMIN_ROLE() view returns (bytes32)',
        'function backupOracle() view returns (address)',
        'function core() view returns (address)',
        'function decimalsNormalizer() view returns (int256)',
        'function doInvert() view returns (bool)',
        'function fei() view returns (address)',
        'function feiBalance() view returns (uint256)',
        'function invert(tuple(uint256 value) price) pure returns (tuple(uint256 value))',
        'function isContractAdmin(address _admin) view returns (bool)',
        'function oracle() view returns (address)',
        'function pause()',
        'function paused() view returns (bool)',
        'function readOracle() view returns (tuple(uint256 value))',
        'function setBackupOracle(address newBackupOracle)',
        'function setContractAdminRole(bytes32 newContractAdminRole)',
        'function setCore(address newCore)',
        'function setDecimalsNormalizer(int256 newDecimalsNormalizer)',
        'function setDoInvert(bool newDoInvert)',
        'function setOracle(address newOracle)',
        'function tribe() view returns (address)',
        'function tribeBalance() view returns (uint256)',
        'function unpause()',
        'function updateOracle()'
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

    const  argsKey : any[] =  [
        `coreAddress`,
        `pairAddress`,
        `duration`, //1 day
        `isPrice0` //isPrice0
    ];

    /// @param _core Fei Core for reference
    /// @param _pair Uniswap Pair to provide TWAP
    /// @param _duration TWAP duration
    /// @param _isPrice0 flag for using token0 or token1 for cumulative on Uniswap

    // const  OracleArgs : any[] =  [
    //     coreAddress,
    //     pairAddress,
    //     DAY, //1 day
    //     true //isPrice0
    // ];

    const  OracleArgs : {[key: string]: any} = {}; 
    
    OracleArgs[`coreAddress`] = coreAddress;
    OracleArgs[`pairAddress`] = pairAddress;
    OracleArgs[`duration`] = DAY;
    OracleArgs[`isPrice0`] = true;



    // Eth-Fei_UniswapOracle
  
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


        // oracleContract = await hre.ethers.getContractAt(oraclerefabi, UniswapOracleResult.address);

        // // await execute(
        // //     'Eth-Fei_UniswapOracle',
        // //     {from: deployer, log: true}, 
        // //     "setDoInvert",
        // //     true
        // // );

        // await oracleContract.setDoInvert(
        //     true
        // )
        


        // await execute(
        //     'Eth-Fei_UniswapOracle',
        //     {from: deployer, log: true}, 
        //     "update"
        // );
    
    
        // peg = await read(
        //     'Eth-Fei_UniswapOracle',
        //     "read"
        // )

    
    
        // log(`Price 1 - peg(After): ${chalk.green(peg)}`);

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
            constructorArguments: Object.values(OracleArgs),
            });
        }


        for(var i in OracleArgs){
            log(chalk.yellow( `Argument: ${i} - value: ${OracleArgs[i]}`));
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