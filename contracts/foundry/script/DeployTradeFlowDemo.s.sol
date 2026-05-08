// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {MockToken} from "../src/MockToken.sol";

contract DeployTradeFlowDemo is Script {
    function run() external returns (MockToken mockToken) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        mockToken = new MockToken(
            "Demo Token",
            "DEMO",
            1_000_000 ether,
            deployer
        );

        vm.stopBroadcast();

        console2.log("MockToken deployed at:", address(mockToken));
        console2.log("Initial receiver:", deployer);
    }
}
