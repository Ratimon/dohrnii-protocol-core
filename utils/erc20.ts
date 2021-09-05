// import { ethers } from "hardhat";
import { ethers }  from "ethers";



export async function getTokenName(tokenAddress: string , provider: ethers.Signer | ethers.providers.Provider | undefined) {

  const abi =  [
      'function name() view returns (string)',
    ]

  const contract = new ethers.Contract(tokenAddress, abi, provider);
  // console.log(contract)
  const name = await contract.name();
  return name;
}


export async function getTokenBalance(tokenAddress: string , address: string, provider: ethers.Signer | ethers.providers.Provider | undefined) {
    // const abi = [{
    //     name: 'balanceOf',
    //     type: 'function',
    //     inputs: [{
    //         name: '_owner',
    //         type: 'address',
    //     }, ],
    //     outputs: [{
    //         name: 'balance',
    //         type: 'uint256',
    //     }, ],
    //     constant: true,
    //     payable: false,
    // }, ];

    const abi =  [
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

    const contract = new ethers.Contract(tokenAddress, abi, provider);
    const balance = await contract.balanceOf(address);
    return balance;
}