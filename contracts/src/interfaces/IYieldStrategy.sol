// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

interface IYieldStrategy {
    function deposit(address token, uint256 amount) external;

    function withdraw(address token, uint256 amount, address recipient) external;

    function totalAssets(address token) external view returns (uint256);

    function harvest(address token) external;
}
