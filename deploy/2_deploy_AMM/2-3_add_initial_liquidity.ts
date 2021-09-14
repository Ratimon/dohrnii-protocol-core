// import chalk from 'chalk';


// import {HardhatRuntimeEnvironment} from 'hardhat/types';
// import {DeployFunction} from 'hardhat-deploy/types';


// import {
//     utils,
// } from 'ethers';

// const { 
//     formatUnits,
// } = utils;


  
// const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
//     const {deployments, getNamedAccounts, network} = hre;
//     const {deploy,execute, get, log, read } = deployments;

//     const {
//         deployer,
//     } = await getNamedAccounts();
    
//     log(`Deploying contracts with the account: ${deployer}`);
    
    
//     const balance = await hre.ethers.provider.getBalance(deployer);
//     log(`Account balance: ${formatUnits(balance, 'ether')} BNB`);
    
    
//     log(`Network Name: ${network.name}`);
//     log("----------------------------------------------------")
    
//     const syntheticAddress = (await get('Fei')).address;
//     let wethAddress: string

//     if(hre.network.tags.test || hre.network.tags.staging) {
//         try {

//             wethAddress  = (await get('WETH9Mock')).address;

//         } catch  (e) {

//             log(chalk.red('Warning: fail trying getting artifacts from deployments, now resusing addresses from hardhat.config.ts'))
//             const accounts = await getNamedAccounts();
//             wethAddress  =  accounts.weth;
        
//         }
//       }
//     else if  (hre.network.tags.production) {
  
//           const accounts = await getNamedAccounts();
//           wethAddress  =  accounts.weth;
//       }
//     else {
//         throw "Wrong tags";
//       }


//     await execute(
//         'UniswapV2Router02',
//         {from: deployer, log: true}, 
//         "addLiquidity",
//         syntheticAddress,
//         wethAddress,
//         )

//         // function addLiquidity(
//         //     address tokenA,
//         //     address tokenB,
//         //     uint amountADesired,
//         //     uint amountBDesired,
//         //     uint amountAMin,
//         //     uint amountBMin,
//         //     address to,
//         //     uint deadline
//         // )


  
// };
// export default func;
// func.tags = ["2-3",'add-liquidity','AMM'];
// func.dependencies = ['2-2'];
// // module.exports.runAtTheEnd = true;
// func.skip = async function (hre: HardhatRuntimeEnvironment) {
//     if(hre.network.tags.production || hre.network.tags.staging){
//         return true;
//     } else{
//         return false;
//     }
// };