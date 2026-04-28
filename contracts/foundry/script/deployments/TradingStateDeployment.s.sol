// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {console2} from "forge-std/console2.sol";

import {CommonConfigLoader} from "../config/CommonConfig.s.sol";
import {TradeOrderBook} from "../../src/trading-state-demo/TradeOrderBook.sol";

abstract contract TradingStateDeployment is CommonConfigLoader {
    struct TradingStateContracts {
        TradeOrderBook tradeOrderBook;
    }

    function deployTradingStateDemo(
        CommonConfig memory commonConfig
    ) internal returns (TradingStateContracts memory contracts_) {
        contracts_.tradeOrderBook = new TradeOrderBook();
    }

    function printTradingStateDeployments(
        CommonConfig memory,
        TradingStateContracts memory contracts_
    ) internal view {
        console2.log("========== Trading State Demo ==========");
        console2.log("TradeOrderBook:", address(contracts_.tradeOrderBook));
        console2.log("========================================");
    }
}
