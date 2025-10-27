// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract StreamVault is Ownable {
    using SafeERC20 for IERC20;

    event Withdrawn(
        address indexed token,
        address indexed account,
        uint256 amount
    );

    constructor() Ownable(msg.sender) {}

    function withdraw(
        address token,
        address account,
        uint256 amount
    ) external onlyOwner {
        IERC20(token).safeTransfer(account, amount);
        emit Withdrawn(token, account, amount);
    }

    function getTokenBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }
}
