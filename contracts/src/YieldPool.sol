// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import {RevenueToken} from "./RevenueToken.sol";
import {RiskOracleAdapter} from "./RiskOracleAdapter.sol";
import {YieldBackedToken} from "./YieldBackedToken.sol";

contract YieldPool is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable baseToken;
    RiskOracleAdapter public immutable riskOracle;
    YieldBackedToken public immutable ybt;

    RevenueToken public revenueToken;
    address public revenueSource;
    uint256 public lastRevenueTimestamp;
    uint256 public totalPrincipal;

    event Deposited(address indexed account, uint256 assets, uint256 shares);
    event Withdrawn(address indexed account, uint256 shares, uint256 assetsReturned);
    event RevenueTokenConfigured(address indexed token);
    event RevenueSourceUpdated(address indexed source);
    event RevenueRecorded(uint256 amount, uint256 totalAssetsAfter);

    constructor(address baseToken_, address riskOracle_, string memory name_, string memory symbol_)
        Ownable(msg.sender)
    {
        require(baseToken_ != address(0), "Base token required");
        require(riskOracle_ != address(0), "Risk oracle required");
        baseToken = IERC20(baseToken_);
        riskOracle = RiskOracleAdapter(riskOracle_);
        ybt = new YieldBackedToken(name_, symbol_, address(this));
    }

    function configureRevenueToken(address token) external onlyOwner {
        require(address(revenueToken) == address(0), "Configured");
        require(token != address(0), "Token required");
        revenueToken = RevenueToken(token);
        emit RevenueTokenConfigured(token);
    }

    function setRevenueSource(address source) external onlyOwner {
        require(source != address(0), "Source required");
        revenueSource = source;
        emit RevenueSourceUpdated(source);
    }

    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Invalid amount");
        require(amount <= availableCapacity(), "Capacity reached");
        baseToken.safeTransferFrom(msg.sender, address(this), amount);
        ybt.mint(msg.sender, amount);
        totalPrincipal += amount;
        emit Deposited(msg.sender, amount, amount);
    }

    function withdraw(uint256 shares) external nonReentrant {
        require(shares > 0, "Invalid shares");
        uint256 supply = ybt.totalSupply();
        require(supply > 0, "No liquidity");
        uint256 assets = (shares * totalAssets()) / supply;
        ybt.burn(msg.sender, shares);
        if (totalPrincipal > 0) {
            uint256 principalReduction = (shares * totalPrincipal) / supply;
            totalPrincipal = principalReduction > totalPrincipal ? 0 : totalPrincipal - principalReduction;
        }
        baseToken.safeTransfer(msg.sender, assets);
        emit Withdrawn(msg.sender, shares, assets);
    }

    function onRevenueReceived(uint256 amount) external nonReentrant {
        require(msg.sender == revenueSource || msg.sender == address(revenueToken), "Not authorized");
        require(amount > 0, "Amount required");
        lastRevenueTimestamp = block.timestamp;
        emit RevenueRecorded(amount, totalAssets());
    }

    function totalAssets() public view returns (uint256) {
        return baseToken.balanceOf(address(this));
    }

    function availableCapacity() public view returns (uint256) {
        if (address(revenueToken) == address(0)) {
            return type(uint256).max;
        }
        uint256 expected = revenueToken.expectedRevenue();
        if (expected == 0) {
            return 0;
        }
        RiskOracleAdapter.RiskData memory data = riskOracle.getRiskData(address(revenueToken));
        uint256 bufferBps = _bandCapacityMultiplier(data.band);
        uint256 maxAssets = (expected * bufferBps) / 10_000;
        uint256 assets = totalAssets();
        return assets >= maxAssets ? 0 : maxAssets - assets;
    }

    function previewWithdraw(uint256 shares) external view returns (uint256) {
        uint256 supply = ybt.totalSupply();
        if (supply == 0) {
            return 0;
        }
        return (shares * totalAssets()) / supply;
    }

    function currentRisk() external view returns (RiskOracleAdapter.RiskData memory) {
        return riskOracle.getRiskData(address(revenueToken));
    }

    function _bandCapacityMultiplier(uint8 band) internal pure returns (uint256) {
        if (band == 0) {
            return 12_000; // Low risk - allow 120% of expected revenue
        }
        if (band == 1) {
            return 9_000; // Medium risk - cap at 90%
        }
        return 6_000; // High risk - cap at 60%
    }
}
