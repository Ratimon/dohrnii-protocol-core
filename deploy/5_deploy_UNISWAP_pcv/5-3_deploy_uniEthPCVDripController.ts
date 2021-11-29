import chalk from 'chalk';
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';


import {
    BigNumber,
    utils,
} from 'ethers';

const {
    parseEther,
    formatUnits,
} = utils;


  
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const {deployments, getNamedAccounts, network} = hre;
    const {deploy, execute, get, log, read } = deployments;

    const {
        deployer,
        dev
    } = await getNamedAccounts();

    log(chalk.cyan(`.....`));
    log(chalk.cyan(`Starting Script.....`));
    
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

    // const  DripPCVControllerArgs : any[] =  [
    //     coreAddress, 
    //     pcvDepositAddress,
    //     ethReserveStabilizerAddress,
    //     7200, // drip every 2 hours
    //     parseEther('1'),
    //     200,
    // ];

    const  DripPCVControllerArgs : {[key: string]: any} = {}; 
    
    DripPCVControllerArgs[`core Address`] = coreAddress;
    DripPCVControllerArgs[`source Address`] = pcvDepositAddress;
    DripPCVControllerArgs[`target Address`] = ethReserveStabilizerAddress;
    DripPCVControllerArgs[`frequency`] = 7200;
    DripPCVControllerArgs[`dripAmount`] = parseEther('1');
    DripPCVControllerArgs[`_incentiveAmount`] = 200;


    const deploymentName = "PCVDripController"
    const DripPCVControllerResult = await deploy(deploymentName, {
        contract: 'PCVDripController', 
        from: deployer,
        args: Object.values(DripPCVControllerArgs),
        log: true,
        deterministicDeployment: false,
    });

    log("------------------ii---------ii---------------------")
    log("----------------------------------------------------")
    log("------------------ii---------ii---------------------")
    log(`Could be found at ....`)
    log(chalk.yellow(`/deployment/${network.name}/${deploymentName}.json`))


    if (DripPCVControllerResult.newlyDeployed) {

        log(`uni-drip-controller contract address: ${chalk.green(DripPCVControllerResult.address)} using ${DripPCVControllerResult.receipt?.gasUsed} gas`);

        for(var i in DripPCVControllerArgs){
            log(chalk.yellow( `Argument: ${i} - value: ${DripPCVControllerArgs[i]}`));
          }

        if(hre.network.tags.production || hre.network.tags.staging){
            await hre.run("verify:verify", {
            address: DripPCVControllerResult.address,
            constructorArguments: Object.values(DripPCVControllerArgs),
            });
        }


    }

    log(chalk.cyan(`Ending Script.....`));
    log(chalk.cyan(`.....`));
};
export default func;
func.tags = ["5-3","uni-drip", "pcv-uni"];
func.dependencies = ['5-2'];
func.skip = async () => true;