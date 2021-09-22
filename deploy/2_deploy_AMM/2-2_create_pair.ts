import chalk from 'chalk';


import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';


import {
    ethers,
    utils,
} from 'ethers';

const { 
    formatUnits,
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
    let wethAddress: string;
    
    let factoryAddress: string
    let pairAddress: string

    let uniFactoryContract : ethers.Contract

   
    const factoryabi =[
        'function allPairs(uint256) view returns (address)',
        'function allPairsLength() view returns (uint256)',
        'function createPair(address tokenA, address tokenB) returns (address pair)',
        'function feeTo() view returns (address)',
        'function feeToSetter() view returns (address)',
        'function getPair(address, address) view returns (address)',
        'function setFeeTo(address _feeTo)',
        'function setFeeToSetter(address _feeToSetter)'
      ]

    if(hre.network.tags.test || hre.network.tags.staging) {

        try {

            wethAddress  = (await get('MockWeth')).address;

        } catch  (e) {

            log(chalk.red('Warning: fail trying getting artifacts from deployments, now resusing addresses from hardhat.config.ts'))
            const accounts = await getNamedAccounts();
            wethAddress  =  accounts.weth;
        
        }

        await execute(
            'UniswapV2Factory',
            {from: deployer, log: true}, 
            "createPair",
            syntheticAddress,
            wethAddress
            );
    
        pairAddress = await read(
            'UniswapV2Factory',
            'getPair',
            syntheticAddress,
            wethAddress
            
        )


      }
    else if  (hre.network.tags.production) {
  
          const accounts = await getNamedAccounts();
          wethAddress  =  accounts.weth;
          factoryAddress = accounts.factory;
        //   pairAddress = accounts.pair_fei_eth;

          uniFactoryContract = await hre.ethers.getContractAt(factoryabi, factoryAddress);

          await uniFactoryContract.createPair(
            syntheticAddress,
            wethAddress
          )

          pairAddress = await uniFactoryContract.getPair(
            syntheticAddress,
            wethAddress
          )

      }
    else {
        throw "Wrong tags";
      }




    log(`The pair has been created at: ${chalk.green(pairAddress)} `);

    log("------------------ii---------ii---------------------")
    log("----------------------------------------------------")
    log("------------------ii---------ii---------------------")


  
};
export default func;
func.tags = ["2-2",'create-pair','AMM'];
func.dependencies = ['2-1'];
// module.exports.runAtTheEnd = true;


//after lunch, add this
// func.skip = async () => true; 

//or 
// func.skip = async function (hre: HardhatRuntimeEnvironment) {
//     if(hre.network.tags.production){
//         return true;
//     } else{
//         return false;
//     }
// };


// func.skip = async function  (hre: HardhatRuntimeEnvironment) {
//     new Promise(async (resolve, reject) => {
//         try {
//             const {getChainId} = hre;
//             const chainId = await getChainId()
//             resolve(chainId !== "31337")
//         } catch (error) {
//             reject(error)
//         }
//     }
// }