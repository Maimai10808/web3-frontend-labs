// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";

import {DemoERC20} from "../src/siwe-eip712-demo/DemoERC20.sol";
import {TokenFaucet} from "../src/siwe-eip712-demo/TokenFaucet.sol";
import {SignedOrderBook} from "../src/siwe-eip712-demo/SignedOrderBook.sol";

contract DeploySiweEip712Demo is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        uint256 claimAmount = 100 ether;
        uint256 cooldown = 1 days;
        uint256 faucetInitialBalance = 1_000_000 ether;

        vm.startBroadcast(deployerPrivateKey);

        DemoERC20 demoERC20 = new DemoERC20("Demo ERC20", "DEMO", deployer);

        TokenFaucet tokenFaucet = new TokenFaucet(
            address(demoERC20),
            claimAmount,
            cooldown,
            deployer
        );

        SignedOrderBook signedOrderBook = new SignedOrderBook();

        demoERC20.mint(address(tokenFaucet), faucetInitialBalance);

        vm.stopBroadcast();

        console2.log("deployer:", deployer);
        console2.log("demoERC20:", address(demoERC20));
        console2.log("tokenFaucet:", address(tokenFaucet));
        console2.log("signedOrderBook:", address(signedOrderBook));
    }
}
