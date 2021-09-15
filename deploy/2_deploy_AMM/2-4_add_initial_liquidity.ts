import chalk from 'chalk';


import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';


import {
    BigNumber,
    ethers,
    utils,
} from 'ethers';

const {
    parseEther,
    formatUnits
} = utils;


  
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const {deployments, getNamedAccounts, network} = hre;
    const {deploy,execute, get, log, read } = deployments;

    const {
        deployer,
    } = await getNamedAccounts();
    
    log(`Deploying contracts with the account: ${deployer}`);
    
    
    const balance = await hre.ethers.provider.getBalance(deployer);
    log(`Account balance: ${formatUnits(balance, 'ether')} BNB`);
    
    
    log(`Network Name: ${network.name}`);
    log("----------------------------------------------------")
    
    let syntheticAddress = (await get('Fei')).address;

    let wethAddress: string
    let wethContract : ethers.Contract

   
    const wethabi =[
        'function approve(address guy, uint256 wad) returns (bool)',
        'function balanceOf(address) view returns (uint256)',
        'function transfer(address dst, uint256 wad) returns (bool)',
        'event Approval(address indexed src, address indexed guy, uint256 wad)',
        'event Transfer(address indexed src, address indexed dst, uint256 wad)',
        'event Deposit(address indexed dst, uint256 wad)',
        'event Withdrawal(address indexed src, uint256 wad)'
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




    let ethAmountToAdd : Number = 1;
    let feiAmountToAdd : Number = 5000;

    const  approveArgs : any[] =  [
        (await get('UniswapV2Router02')).address,
        BigNumber.from("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
    ];


    if(hre.network.tags.test || hre.network.tags.staging) {

        const  mintETHArgs : any[] =  [
            deployer,
            parseEther(`${ethAmountToAdd}`)
        ];
    
        await execute(
            'MockWeth',
            {from: deployer, log: true}, 
            "mint",
            ...mintETHArgs
        )

        await execute(
            'MockWeth',
            {from: deployer, log: true}, 
            "approve",
            ...approveArgs
        )

    } else if (hre.network.tags.production) {

        const deployerETHBalance: BigNumber = await read(
            'MockWeth',
            "balanceOf",
            deployer
        )

        if(deployerETHBalance.lt(parseEther(`${ethAmountToAdd}`))) {
            throw "The eth balance is not enough";
        }

        wethContract  = await hre.ethers.getContractAt(wethabi, wethAddress);

        await wethContract
        .approve(
            (await get('UniswapV2Router02')).address,
            BigNumber.from("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
        )

    } else {
        throw "Wrong tag";
    }

    await execute(
        'DohrniiCore',
        {from: deployer, log: true}, 
        "grantMinter",
        deployer
    );


    const  mintFEIArgs : any[] =  [
        deployer,
        parseEther(`${feiAmountToAdd}`)
    ];


    await execute(
        'Fei',
        {from: deployer, log: true}, 
        "mint",
        ...mintFEIArgs
    )

    await execute(
        'Fei',
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


  
};
export default func;
func.tags = ["2-4",'add-liquidity','AMM'];
func.dependencies = ['2-3'];
// module.exports.runAtTheEnd = true;
func.skip = async function (hre: HardhatRuntimeEnvironment) {
    if(hre.network.tags.production || hre.network.tags.staging){
        return true;
    } else{
        return false;
    }
};