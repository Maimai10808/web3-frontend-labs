// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {TokenFactory} from "../src/token-launch-demo/TokenFactory.sol";

contract DeployTokenLaunch is Script {
    function run() external returns (TokenFactory factory) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);
        factory = new TokenFactory();
        vm.stopBroadcast();
    }
}
