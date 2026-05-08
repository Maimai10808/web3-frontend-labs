// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {TradeOrderBook} from "../src/trading-state-demo/TradeOrderBook.sol";

contract DeployTradingStateDemo is Script {
    function run() external returns (TradeOrderBook tradeOrderBook) {
        vm.startBroadcast();

        tradeOrderBook = new TradeOrderBook();

        vm.stopBroadcast();

        console2.log("TradeOrderBook deployed at:", address(tradeOrderBook));
    }
}
