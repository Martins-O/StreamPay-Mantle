// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IYieldStrategy} from "../../src/interfaces/IYieldStrategy.sol";

contract MockYieldStrategy is IYieldStrategy {
    mapping(address => uint256) public balances;

    function deposit(address token, uint256 amount) external override {
        balances[token] += amount;
        // tokens already transferred to this contract
    }

    function withdraw(address token, uint256 amount, address recipient) external override {
        uint256 currentBalance = balances[token];
        require(currentBalance >= amount, "Insufficient strategy balance");
        balances[token] = currentBalance - amount;
        IERC20(token).transfer(recipient, amount);
    }

    function totalAssets(address token) external view override returns (uint256) {
        return balances[token];
    }

    function harvest(address)
        /**
         * token
         */
        external
        pure
        override
    {}
}
