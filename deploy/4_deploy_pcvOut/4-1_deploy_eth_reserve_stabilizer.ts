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


import {
    advanceTimeAndBlock
} from "../../utils";

const DAY = BigNumber.from(24 * 60 * 60);
  
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


    let coreAddress = (await get('DohrniiCore')).address;
    let FeiPerEthOracle = (await get('FeiPerEthUniswapOracle')).address;
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


    /// @param _core Fei Core to reference
    /// @param _oracle the ETH price oracle to reference
    /// @param _backupOracle the backup oracle to reference
    /// @param _usdPerFeiBasisPoints the USD price per FEI to sell ETH at
    const  ReserveArgs : any[] =  [
        coreAddress, 
        //TODO: consider using chainlinkEthUsdOracleWrapperAddress
        FeiPerEthOracle, //    address _oracle,
        FeiPerEthOracle,  //   address _backupOracle,
        9900, //     uint256 _usdPerFeiBasisPoints,
        wethAddress
    ];

  
    const ReserveResult = await deploy("EthReserveStabilizer", {
        contract: 'EthReserveStabilizer', 
        from: deployer,
        args: ReserveArgs,
        log: true,
        deterministicDeployment: false,
    });

    log(chalk.yellow("We may update these following addresses at hardhatconfig.ts "));
    log("------------------ii---------ii---------------------")
    log("----------------------------------------------------")
    log("------------------ii---------ii---------------------")


    if (ReserveResult.newlyDeployed) {

        log(`reserve contract address: ${chalk.green(ReserveResult.address)} at key reserve using ${ReserveResult.receipt?.gasUsed} gas`);

        if(hre.network.tags.production || hre.network.tags.staging){
            await hre.run("verify:verify", {
            address: ReserveResult.address,
            constructorArguments: ReserveArgs,
            });
        }


    }
};
export default func;
func.tags = ["4-1","reserve", "pcv-out"];
func.dependencies = ['oracle'];
// func.skip = async () => true;