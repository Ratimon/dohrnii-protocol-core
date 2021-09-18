// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

import "../openzeppelin/utils/math/Math.sol";
import "../openzeppelin/utils/math/SafeMath.sol";

import "../external/Roots.sol";
import "./BondingCurve.sol";

    

/// @title a bonding curve for purchasing FEI with ETH
/// @author Fei Protocol
contract GenesisEthBondingCurve is BondingCurve {

    using SafeMath for uint256;
    using Roots for uint256;
    using Decimal for Decimal.D256;

    uint256 internal immutable SHIFT; // k shift

    struct BondingCurveParams {
        uint256 scale;
        uint256 buffer;
        uint256 discount;
        uint256 duration;
        uint256 incentive;
        address[] pcvDeposits;
        uint256[] ratios;
    }

    constructor(
        address core,
        address oracle,
        address backupOracle,
        BondingCurveParams memory params
    )
        BondingCurve(
            core,
            oracle,
            backupOracle,
            params.scale,
            params.pcvDeposits,
            params.ratios,
            params.duration,
            params.incentive,
            IERC20(address(0)),
            params.discount,
            params.buffer
        )
    {
        SHIFT = scale / 3; // Enforces a .50c starting price per bonding curve formula
        //(k)^0.5 / (k + S)^0.5 = 0.5
        //3k=S
    }

    /// @notice purchase FEI for underlying tokens
    /// @param to address to receive FEI
    /// @param amountIn amount of underlying tokens input
    /// @return amountOut amount of FEI received
    function purchase(address to, uint256 amountIn)
        external
        payable
        override
        whenNotPaused
        returns (uint256 amountOut)
    {
        require(
            msg.value == amountIn,
            "Bonding Curve: Sent value does not equal input"
        );
        return _purchase(amountIn, to);
    }

    /// @notice return amount of FEI received after a bonding curve purchase
    /// @param amountIn the amount of underlying used to purchase
    /// @return amountOut the amount of FEI received
    /// @dev Can be innacurate if outdated, need to call `oracle().isOutdated()` to check
    function getAmountOut(uint256 amountIn)
        public
        view
        override
        returns (uint256 amountOut)
    {
        //fei
        // uint256 adjustedAmount = _getAdjustedAmount(amountIn);

        // amountOut = _getBufferAdjustedAmount(adjustedAmount);

        uint256 feiValueOfAmountIn = readOracle().mul(amountIn).asUint256();

        Decimal.D256 memory price = getCurrentPrice();


        // if (atScale()) {
        //     return amountOut;
        // }

        // return Math.max(amountOut, _getBondingCurveAmountOut(adjustedAmount)); // Cap price at buffer adjusted

        if (!atScale()) {
            uint256 preScaleAmount = scale - totalPurchased;

            // crossing scale
            if (feiValueOfAmountIn > preScaleAmount) {
                uint256 postScaleAmount = feiValueOfAmountIn - preScaleAmount;
                // combined pricing of pre-scale price times the amount to reach scale and post-scale price times remainder
                Decimal.D256 memory preScaleAmountOut = Decimal.D256(_getBondingCurveAmountOut(feiValueOfAmountIn));

                return preScaleAmountOut.add(_getBufferMultiplier().mul(postScaleAmount)).asUint256();

                // return price.mul(preScaleAmount).add(_getBufferMultiplier().mul(postScaleAmount)).asUint256();
            }
        }

        amountOut = price.mul(feiValueOfAmountIn).asUint256();

        
    }

    // /// @notice multiplies amount in by the peg to convert to FEI
    // function _getAdjustedAmount(uint256 amountIn)
    //     internal
    //     view
    //     returns (uint256)
    // {
    //     return peg().mul(amountIn).asUint256();
    // }

    // function _getBufferAdjustedAmount(uint256 amountIn)
    //     internal
    //     view
    //     returns (uint256)
    // {
    //     return _getBufferMultiplier().mul(amountIn).asUint256();
    // }

    //0.6.6 TASK:CHECK
    // /// @notice returns the buffer on the post-scale bonding curve price
    // function _getBufferMultiplier() internal view returns (Decimal.D256 memory) {
    //     uint256 granularity = BUFFER_GRANULARITY;
    //     // uses granularity - buffer (i.e. 1-b) instead of 1+b because the peg is inverted
    //     return Decimal.ratio(granularity - buffer, granularity);
    // }

    // Bonding curve formula is sqrt(k+x)/sqrt(k+S)
    function _getBondingCurvePriceMultiplier()
        internal
        view
        override
        returns (Decimal.D256 memory)
    {
        return
            Decimal.ratio(_shift(totalPurchased).sqrt(), _shift(scale).sqrt());
    }



        // Represents the integral solved for upper bound of P(x) = ((k+X)/(k+S))^1/2 * O. Subtracting starting point C
    function _getBondingCurveAmountOut(uint256 adjustedAmountIn)
        internal
        view
        virtual
        returns (uint256 amountOut)
    {
        uint256 shiftTotal = _shift(totalPurchased); // k + C
        uint256 shiftTotalCubed = shiftTotal.mul(shiftTotal.mul(shiftTotal));
        uint256 radicand =
            (adjustedAmountIn.mul(3).mul(_shift(scale).sqrt()) / 2).add(
                shiftTotalCubed.sqrt()
            );
        return (radicand.cubeRoot() ** 2).sub(shiftTotal); // result - (k + C)
    }


    /// @notice get the balance of ETH held by the contract and ready to be allocated
    function balance() public view override returns (uint256) {
        return address(this).balance;
    }

    function _allocateSingle(uint256 amount, address pcvDeposit)
        internal
        override
    {
        Address.sendValue(payable(pcvDeposit), amount);
        IPCVDeposit(pcvDeposit).deposit();
    }

    function _shift(uint256 x) internal view returns (uint256) {
        return SHIFT.add(x);
    }
}