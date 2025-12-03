// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Script, console} from "forge-std/Script.sol";
import {RevenueTokenFactory} from "../src/RevenueTokenFactory.sol";

contract MintRevenueTokenScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address factoryAddress = vm.envAddress("REVENUE_TOKEN_FACTORY_ADDRESS");
        address paymentToken = _envOrAddress("PAYMENT_TOKEN_ADDRESS", vm.envAddress("MOCK_USDT_ADDRESS"));

        string memory tokenName = _envOrString("REVENUE_TOKEN_NAME", "StreamYield Revenue 1");
        string memory tokenSymbol = _envOrString("REVENUE_TOKEN_SYMBOL", "SYREV1");
        uint256 expectedRevenue = vm.envOr("REVENUE_TOKEN_EXPECTED", uint256(500_000 * 1e6));
        uint256 tenor = vm.envOr("REVENUE_TOKEN_TENOR", uint256(90 days));

        vm.startBroadcast(deployerPrivateKey);

        RevenueTokenFactory factory = RevenueTokenFactory(factoryAddress);
        address token = factory.createRevenueToken(
            RevenueTokenFactory.CreateRevenueTokenParams({
                name: tokenName,
                symbol: tokenSymbol,
                expectedRevenue: expectedRevenue,
                tenor: tenor,
                paymentToken: paymentToken
            })
        );

        vm.stopBroadcast();

        console.log("RevenueToken minted:", token);
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
