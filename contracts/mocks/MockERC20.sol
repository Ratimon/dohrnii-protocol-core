// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

import "../openzeppelin/token/ERC20/extensions/ERC20Burnable.sol";
import "../openzeppelin/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20, ERC20Burnable {
    constructor(
       string memory tokenName
    ) ERC20(tokenName, "MCT") {}

    function mint(address account, uint256 amount) public returns (bool) {
        _mint(account, amount);
        return true;
    }
}
