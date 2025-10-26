// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "forge-std/Script.sol";
import "../src/StreamManager.sol";
import "../src/MockERC20.sol";

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
        console.log("StreamVault deployed to:", address(streamManager.vault()));
        console.log("Mock USDT deployed to:", address(mockUSDT));

        // Save deployment info to a file
        string memory deploymentInfo = string(
            abi.encodePacked(
                "STREAM_MANAGER_ADDRESS=", vm.toString(address(streamManager)), "\n",
                "STREAM_VAULT_ADDRESS=", vm.toString(address(streamManager.vault())), "\n",
                "MOCK_USDT_ADDRESS=", vm.toString(address(mockUSDT)), "\n"
            )
        );

        vm.writeFile("./deployment.env", deploymentInfo);
        console.log("Deployment addresses saved to deployment.env");
    }
}