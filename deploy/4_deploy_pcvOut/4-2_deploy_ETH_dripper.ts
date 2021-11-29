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
    let reserveStabilizerAddress = (await get('EthReserveStabilizer')).address;

   /// @param _core Fei Core for reference
   /// @param _target address to drip to
   /// @param _frequency frequency of dripping
   /// @param _amountToDrip amount to drip on each drip

    // const  DripperArgs : any[] =  [
    //     coreAddress, 
    //     reserveStabilizerAddress, //     address _oracle,
    //     7200,  //drip every 2 hours     uint256 _frequency 
    //     parseEther('1'), //     uint256 _amountToDrip
    // ];

    const  DripperArgs : {[key: string]: any} = {}; 
    
    DripperArgs[`core Address`] = coreAddress;
    DripperArgs[`target address`] = reserveStabilizerAddress;
    DripperArgs[`frequency`] = 7200;
    DripperArgs[`amountToDrip`] = parseEther('1');

    const deploymentName = "EthPCVDripper"
    const DripperResult = await deploy(deploymentName, {
        contract: 'EthPCVDripper', 
        from: deployer,
        args: Object.values(DripperArgs),
        log: true,
        deterministicDeployment: false,
    });

    log("------------------ii---------ii---------------------")
    log("----------------------------------------------------")
    log("------------------ii---------ii---------------------")
    log(`Could be found at ....`)
    log(chalk.yellow(`/deployment/${network.name}/${deploymentName}.json`))


    if (DripperResult.newlyDeployed) {

        log(`dripper contract address: ${chalk.green(DripperResult.address)} using ${DripperResult.receipt?.gasUsed} gas`);

        for(var i in DripperArgs){
            log(chalk.yellow( `Argument: ${i} - value: ${DripperArgs[i]}`));
        }

        if(hre.network.tags.production || hre.network.tags.staging){
            await hre.run("verify:verify", {
            address: DripperResult.address,
            constructorArguments: Object.values(DripperArgs),
            });
        }

    }

    log(chalk.cyan(`Ending Script.....`));
    log(chalk.cyan(`.....`));
};
export default func;
func.tags = ["4-2","dripper", "pcv-out"];
func.dependencies = ['4-1'];
// func.skip = async () => true;