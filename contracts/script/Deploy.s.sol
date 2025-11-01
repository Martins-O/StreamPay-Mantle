// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Script, console} from "forge-std/Script.sol";
import {StreamManager} from "../src/StreamManager.sol";
import {MockERC20} from "../src/MockERC20.sol";

// Note: AccountingLib is a pure library linked inside StreamManager, so it does not
// require a separate deployment. StreamVault is created by the StreamManager constructor.

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy StreamManager (this will also deploy StreamVault)
        StreamManager streamManager = new StreamManager();

        // Deploy a mock USDT token for testing
        MockERC20 mockUSDT = new MockERC20(
            "Mock USDT",
            "mUSDT",
            1000000000 * 1e6 // 1 billion tokens
        );

        vm.stopBroadcast();

        // Log deployment addresses
        console.log("StreamManager deployed to:", address(streamManager));
        console.log("StreamVault deployed to:", address(streamManager.VAULT()));
        console.log("Mock USDT deployed to:", address(mockUSDT));
        console.log("Stream token address:", address(mockUSDT));
        console.log("\nCopy the addresses above into contracts/deployment.env and frontend/.env.local.");
    }
}
