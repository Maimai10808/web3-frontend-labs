// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {LaunchERC721Factory} from "../src/token-launch-demo/LaunchERC721Factory.sol";

contract DeployNftCollectionFactory is Script {
    function run() external returns (LaunchERC721Factory factory) {
        vm.startBroadcast();

        factory = new LaunchERC721Factory();

        vm.stopBroadcast();

        console2.log("LaunchERC721Factory deployed at:", address(factory));
    }
}
