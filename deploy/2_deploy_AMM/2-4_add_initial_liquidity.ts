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


    let wethAddress: string;
    let syntheticAddress : string;
    let routerAddress: string;

    let wethContract : ethers.Contract
    let uniRouterContract : ethers.Contract


    let ethAmountToAdd : Number 
    let feiAmountToAdd : Number

   
    const wethabi =[
        'function approve(address guy, uint256 wad) returns (bool)',
        'function balanceOf(address) view returns (uint256)',
        'function transfer(address dst, uint256 wad) returns (bool)',
        'event Approval(address indexed src, address indexed guy, uint256 wad)',
        'event Transfer(address indexed src, address indexed dst, uint256 wad)',
        'event Deposit(address indexed dst, uint256 wad)',
        'event Withdrawal(address indexed src, uint256 wad)'
      ]


    const routerabi =[
        'function WETH() view returns (address)',
        'function addLiquidity(address tokenA, address tokenB, uint256 amountADesired, uint256 amountBDesired, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) returns (uint256 amountA, uint256 amountB, uint256 liquidity)',
        'function addLiquidityETH(address token, uint256 amountTokenDesired, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline) payable returns (uint256 amountToken, uint256 amountETH, uint256 liquidity)',
        'function factory() view returns (address)',
        'function getAmountIn(uint256 amountOut, uint256 reserveIn, uint256 reserveOut) pure returns (uint256 amountIn)',
        'function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) pure returns (uint256 amountOut)',
        'function getAmountsIn(uint256 amountOut, address[] path) view returns (uint256[] amounts)',
        'function getAmountsOut(uint256 amountIn, address[] path) view returns (uint256[] amounts)',
        'function quote(uint256 amountA, uint256 reserveA, uint256 reserveB) pure returns (uint256 amountB)',
        'function removeLiquidity(address tokenA, address tokenB, uint256 liquidity, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) returns (uint256 amountA, uint256 amountB)',
        'function removeLiquidityETH(address token, uint256 liquidity, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline) returns (uint256 amountToken, uint256 amountETH)',
        'function removeLiquidityETHSupportingFeeOnTransferTokens(address token, uint256 liquidity, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline) returns (uint256 amountETH)',
        'function removeLiquidityETHWithPermit(address token, uint256 liquidity, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline, bool approveMax, uint8 v, bytes32 r, bytes32 s) returns (uint256 amountToken, uint256 amountETH)',
        'function removeLiquidityETHWithPermitSupportingFeeOnTransferTokens(address token, uint256 liquidity, uint256 amountTokenMin, uint256 amountETHMin, address to, uint256 deadline, bool approveMax, uint8 v, bytes32 r, bytes32 s) returns (uint256 amountETH)',
        'function removeLiquidityWithPermit(address tokenA, address tokenB, uint256 liquidity, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline, bool approveMax, uint8 v, bytes32 r, bytes32 s) returns (uint256 amountA, uint256 amountB)',
        'function swapETHForExactTokens(uint256 amountOut, address[] path, address to, uint256 deadline) payable returns (uint256[] amounts)',
        'function swapExactETHForTokens(uint256 amountOutMin, address[] path, address to, uint256 deadline) payable returns (uint256[] amounts)',
        'function swapExactETHForTokensSupportingFeeOnTransferTokens(uint256 amountOutMin, address[] path, address to, uint256 deadline) payable',
        'function swapExactTokensForETH(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline) returns (uint256[] amounts)',
        'function swapExactTokensForETHSupportingFeeOnTransferTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline)',
        'function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline) returns (uint256[] amounts)',
        'function swapExactTokensForTokensSupportingFeeOnTransferTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline)',
        'function swapTokensForExactETH(uint256 amountOut, uint256 amountInMax, address[] path, address to, uint256 deadline) returns (uint256[] amounts)',
        'function swapTokensForExactTokens(uint256 amountOut, uint256 amountInMax, address[] path, address to, uint256 deadline) returns (uint256[] amounts)'
      ]


    

    if(hre.network.tags.test || hre.network.tags.staging) {
        try {

            wethAddress  = (await get('MockWeth')).address;
            routerAddress = (await get('UniswapV2Router02')).address

        } catch  (e) {

            log(chalk.red('Warning: fail trying getting artifacts from deployments, now resusing addresses from hardhat.config.ts'))
            const accounts = await getNamedAccounts();
            wethAddress  =  accounts.weth;
            routerAddress=  accounts.router;
        
        }
      }
    else if  (hre.network.tags.production) {
  
          const accounts = await getNamedAccounts();
          wethAddress  =  accounts.weth;
          routerAddress=  accounts.router;
      }
    else {
        throw "Wrong tags";
      }

    syntheticAddress = (await get('Fei')).address;

    // 20/5000 = 40 => eth per fei
    // 5000/20 = 25 => fei per eth


    ethAmountToAdd  = 20;
    feiAmountToAdd = 5000;

    const  approveArgs : any[] =  [
        routerAddress,
        BigNumber.from("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")
    ];

    const  mintFEIArgs : any[] =  [
        deployer,
        parseEther(`${feiAmountToAdd}`)
    ];

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

        await execute(
            'DohrniiCore',
            {from: deployer, log: true}, 
            "grantMinter",
            deployer
        );

    
        await execute(
            'Fei',
            {from: deployer, log: true}, 
            "mint",
            ...mintFEIArgs
        )

        await execute(
            'DohrniiCore',
            {from: deployer, log: true}, 
            "revokeMinter",
            deployer
        );
    
        await execute(
            'Fei',
            {from: deployer, log: true}, 
            "approve",
            ...approveArgs
        )
             
    
        
        await execute(
            'UniswapV2Router02',
            {from: deployer, log: true}, 
            "addLiquidity",
            ...addLiquidityArgs
        )

    } else if (hre.network.tags.production) {

        // const accounts = await getNamedAccounts();
        // const routerAddress  =  accounts.router;

        wethContract  = await hre.ethers.getContractAt(wethabi, wethAddress);
        uniRouterContract = await hre.ethers.getContractAt(routerabi, routerAddress);


        const deployerETHBalance: BigNumber = await wethContract
            .balanceOf(
                deployer
            )

        // const deployerETHBalance: BigNumber = await read(
        //     'MockWeth',
        //     "balanceOf",
        //     deployer
        // )

        if(deployerETHBalance.lt(parseEther(`${ethAmountToAdd}`))) {
            throw "The eth balance is not enough";
        }

        
        await wethContract
            .approve(
                ...approveArgs
            )

        await execute(
            'DohrniiCore',
            {from: deployer, log: true}, 
            "grantMinter",
            deployer
        );

    
        await execute(
            'Fei',
            {from: deployer, log: true}, 
            "mint",
            ...mintFEIArgs
        )


        await execute(
            'DohrniiCore',
            {from: deployer, log: true}, 
            "revokeMinter",
            deployer
        );
    
        await execute(
            'Fei',
            {from: deployer, log: true}, 
            "approve",
            ...approveArgs
        )


        await uniRouterContract
            .addLiquidity(
                ...addLiquidityArgs
            )

            

    } else {
        throw "Wrong tag";
    }




  
};
export default func;
func.tags = ["2-4",'add-liquidity','AMM'];
func.dependencies = ['2-3'];
// module.exports.runAtTheEnd = true;

//after lunch, add this
// func.skip = async () => true; 

//or 


// func.skip = async function (hre: HardhatRuntimeEnvironment) {

//     const {getNamedAccounts} = hre;

//     const {
//         deployer,
//     } = await getNamedAccounts();

//     // fetchIfDifferent
//     const isRouterNewlyDepoyed = await hre.deployments.fetchIfDifferent( 'UniswapV2Router02',{
//         contract: 'UniswapV2Router02',
//         from: deployer
//     });


//     if(hre.network.tags.production && isRouterNewlyDepoyed){
//     // if(hre.network.tags.production){
//         return true;
//     } else{
//         return false;
//     }
// };
