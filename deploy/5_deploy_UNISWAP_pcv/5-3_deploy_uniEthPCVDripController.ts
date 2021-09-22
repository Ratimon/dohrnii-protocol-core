import chalk from 'chalk';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';


import {
    BigNumber,
    utils,
} from 'ethers';
import { parseEther } from '@ethersproject/units';

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



    let coreAddress = (await get('DohrniiCore')).address;
    let pcvDepositAddress = (await get('UniswapPCVDeposit')).address;
    let ethReserveStabilizerAddress = (await get('EthReserveStabilizer')).address;

    
    /// @notice PCV Drip Controller constructor
    /// @param _core Fei Core for reference
    /// @param _source the PCV deposit to drip from
    /// @param _target the PCV deposit to drip to
    /// @param _frequency frequency of dripping
    /// @param _dripAmount amount to drip on each drip
    /// @param _incentiveAmount the FEI incentive for calling drip

    const  DripPCVControllerArgs : any[] =  [
        coreAddress, 
        pcvDepositAddress,
        ethReserveStabilizerAddress,
        7200, // drip every 2 hours
        parseEther('1'),
        200,
    ];

  
    const DripPCVControllerResult = await deploy("UniswapDripPCVController", {
        contract: 'PCVDripController', 
        from: deployer,
        args: DripPCVControllerArgs,
        log: true,
        deterministicDeployment: false,
    });

    log(chalk.yellow("We may update these following addresses at hardhatconfig.ts "));
    log("------------------ii---------ii---------------------")
    log("----------------------------------------------------")
    log("------------------ii---------ii---------------------")


    if (DripPCVControllerResult.newlyDeployed) {

        log(`uni-drip-controller contract address: ${chalk.green(DripPCVControllerResult.address)} at key uni-drip-controller using ${DripPCVControllerResult.receipt?.gasUsed} gas`);

        if(hre.network.tags.production || hre.network.tags.staging){
            await hre.run("verify:verify", {
            address: DripPCVControllerResult.address,
            constructorArguments: DripPCVControllerArgs,
            });
        }


    }
};
export default func;
func.tags = ["5-3","uni-drip", "pcv-uni"];
func.dependencies = ['5-2'];
func.skip = async () => true;