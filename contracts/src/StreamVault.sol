// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IYieldStrategy} from "./interfaces/IYieldStrategy.sol";

contract StreamVault is Ownable {
    using SafeERC20 for IERC20;

    event Withdrawn(address indexed token, address indexed account, uint256 amount);

    event StrategySet(address indexed token, address indexed strategy, uint16 reserveRatioBps);

    event StrategyCleared(address indexed token);

    event StrategyAllocated(address indexed token, address indexed strategy, uint256 amount);

    event StrategyHarvested(address indexed token);

    struct StrategyConfig {
        IYieldStrategy strategy;
        uint16 reserveRatioBps;
        bool enabled;
    }

    mapping(address => StrategyConfig) private _strategies;

    constructor() Ownable(msg.sender) {}

    function withdraw(address token, address account, uint256 amount) external onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));
        if (balance < amount) {
            _pullFromStrategy(token, amount - balance);
        }

        IERC20(token).safeTransfer(account, amount);
        emit Withdrawn(token, account, amount);
    }

    function getTokenBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }

    function getTotalManaged(address token) external view returns (uint256) {
        StrategyConfig storage config = _strategies[token];
        uint256 total = IERC20(token).balanceOf(address(this));
        if (config.enabled) {
            total += config.strategy.totalAssets(token);
        }
        return total;
    }

    function getStrategy(address token)
        external
        view
        returns (address strategy, uint16 reserveRatioBps, bool enabled)
    {
        StrategyConfig storage config = _strategies[token];
        return (address(config.strategy), config.reserveRatioBps, config.enabled);
    }

    function setStrategy(address token, address strategy, uint16 reserveRatioBps) external onlyOwner {
        require(reserveRatioBps <= 10_000, "Invalid reserve");

        if (strategy == address(0)) {
            delete _strategies[token];
            emit StrategyCleared(token);
            return;
        }

        _strategies[token] =
            StrategyConfig({strategy: IYieldStrategy(strategy), reserveRatioBps: reserveRatioBps, enabled: true});

        emit StrategySet(token, strategy, reserveRatioBps);
    }

    function pushToStrategy(address token) external onlyOwner {
        StrategyConfig storage config = _strategies[token];
        if (!config.enabled) {
            return;
        }

        uint256 balance = IERC20(token).balanceOf(address(this));
        if (balance == 0) {
            return;
        }

        uint256 reserve = (balance * config.reserveRatioBps) / 10_000;
        uint256 amountToDeposit = balance > reserve ? balance - reserve : 0;
        if (amountToDeposit == 0) {
            return;
        }

        IERC20(token).safeTransfer(address(config.strategy), amountToDeposit);
        config.strategy.deposit(token, amountToDeposit);

        emit StrategyAllocated(token, address(config.strategy), amountToDeposit);
    }

    function harvestYield(address token) external onlyOwner {
        StrategyConfig storage config = _strategies[token];
        require(config.enabled, "No strategy");
        config.strategy.harvest(token);
        emit StrategyHarvested(token);
    }

    function _pullFromStrategy(address token, uint256 amountNeeded) internal {
        StrategyConfig storage config = _strategies[token];
        require(config.enabled, "Insufficient liquidity");
        config.strategy.withdraw(token, amountNeeded, address(this));
    }
}
