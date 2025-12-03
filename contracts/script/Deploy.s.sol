// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Script, console} from "forge-std/Script.sol";
import {MockERC20} from "../src/MockERC20.sol";
import {StreamEngine} from "../src/StreamEngine.sol";
import {RevenueTokenFactory} from "../src/RevenueTokenFactory.sol";
import {RiskOracleAdapter} from "../src/RiskOracleAdapter.sol";
import {YieldPool} from "../src/YieldPool.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address riskSigner = _envOrAddress("RISK_SIGNER_ADDRESS", vm.addr(deployerPrivateKey));
        address baseTokenOverride = vm.envOr("BASE_TOKEN_ADDRESS", address(0));
        string memory poolName = _envOrString("YIELD_POOL_NAME", "StreamYield Primary");
        string memory poolSymbol = _envOrString("YIELD_POOL_SYMBOL", "sYLD");

        vm.startBroadcast(deployerPrivateKey);

        StreamEngine streamEngine = new StreamEngine();

        address baseTokenAddress = baseTokenOverride;
        MockERC20 mockUSDT;
        if (baseTokenAddress == address(0)) {
            mockUSDT = new MockERC20("Mock USDT", "mUSDT", 1_000_000_000 * 1e6);
            baseTokenAddress = address(mockUSDT);
        }

        RevenueTokenFactory revenueFactory = new RevenueTokenFactory();
        RiskOracleAdapter riskOracle = new RiskOracleAdapter(riskSigner);
        YieldPool yieldPool = new YieldPool(baseTokenAddress, address(riskOracle), poolName, poolSymbol);
        yieldPool.setRevenueSource(address(streamEngine));

        vm.stopBroadcast();

        address vaultAddress = address(streamEngine.VAULT());
        address ybtAddress = address(yieldPool.ybt());

        console.log("StreamEngine deployed to:", address(streamEngine));
        console.log("StreamVault deployed to:", vaultAddress);
        console.log("Base token (Mock or existing) at:", baseTokenAddress);
        console.log("RevenueTokenFactory deployed to:", address(revenueFactory));
        console.log("RiskOracleAdapter deployed to:", address(riskOracle));
        console.log("YieldPool deployed to:", address(yieldPool));
        console.log("YieldBackedToken deployed to:", ybtAddress);

        console.log("\nCopy the addresses above into deployment.env and your frontend/backend env files.");
    }

    function _envOrString(string memory key, string memory defaultValue) internal view returns (string memory) {
        try vm.envString(key) returns (string memory value) {
            return value;
        } catch {
            return defaultValue;
        }
    }

    function _envOrAddress(string memory key, address defaultValue) internal view returns (address) {
        try vm.envAddress(key) returns (address value) {
            return value;
        } catch {
            return defaultValue;
        }
    }
}
