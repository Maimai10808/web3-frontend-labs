// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";

import {TokenFactory} from "../src/token-launch-demo/TokenFactory.sol";

contract DeployTokenLaunch is Script {
    function run() external returns (TokenFactory factory) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        factory = new TokenFactory();

        vm.stopBroadcast();

        console2.log("========== Token Launch Demo ==========");
        console2.log("TokenFactory:", address(factory));
        console2.log("=======================================");
    }
}
