// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "../openzeppelin/token/ERC20/ERC20.sol";
import "../openzeppelin/token/ERC20/extensions/draft-ERC20Permit.sol";
// import "../openzeppelin/token/ERC20/extensions/ERC20Votes.sol";
import "../openzeppelin/token/ERC20/extensions/ERC20VotesComp.sol";


contract Jelly is ERC20, ERC20Permit, ERC20VotesComp {

    /// @notice Address which may mint new tokens
    address public minter;

    /// @notice An event thats emitted when the minter address is changed
    event MinterChanged(address minter, address newMinter);


    /**
     * @notice Construct a new Tribe token
     * @param account The initial account to grant all the tokens
     * @param minter_ The account with minting ability
     */
    constructor(
        address account,
        address minter_
    )
        ERC20("Jelly", "JELLY")
        ERC20Permit("Jelly")
    {
        _mint(account, 1_000_000_000 * 10 ** decimals());
        // _mint(account, 1_000_000_000e18);
        minter = minter_;
        emit MinterChanged(address(0), minter);
    }

    /**
     * @notice Change the minter address
     * @param minter_ The address of the new minter
     */
    function setMinter(address minter_) external {
        require(msg.sender == minter, "Tribe: only the minter can change the minter address");
        emit MinterChanged(minter, minter_);
        minter = minter_;
    }


    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    // The following functions are overrides required by Solidity.

    function _afterTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._burn(account, amount);
    }
}