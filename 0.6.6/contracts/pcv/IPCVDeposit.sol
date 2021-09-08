pragma solidity ^0.6.2;

interface IPCVDeposit {
    // ----------- Events -----------
    event Deposit(address indexed _from, uint256 _amount);

    event Withdrawal(
        address indexed _caller,
        address indexed _to,
        uint256 _amount
    );

    // ----------- State changing api -----------

    function deposit(uint256 amount) external payable;

    // ----------- PCV Controller only state changing api -----------

    function withdraw(address to, uint256 amount) external;

    // ----------- Getters -----------

    function totalValue() external view returns (uint256);
}