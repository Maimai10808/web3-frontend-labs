// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {console2} from "forge-std/console2.sol";

import {CommonConfigLoader} from "../config/CommonConfig.s.sol";
import {MockToken} from "../../src/MockToken.sol";

abstract contract TradeFlowDeployment is CommonConfigLoader {
    struct TradeFlowContracts {
        MockToken mockToken;
    }

    function deployTradeFlowDemo(
        CommonConfig memory commonConfig
    ) internal returns (TradeFlowContracts memory contracts_) {
        contracts_.mockToken = deployMockToken({
            name: "Demo Token",
            symbol: "DEMO",
            initialSupply: 1_000_000 ether,
            initialReceiver: commonConfig.initialReceiver
        });
    }

    function deployMockToken(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address initialReceiver
    ) internal returns (MockToken token) {
        token = new MockToken(name, symbol, initialSupply, initialReceiver);
    }

    function printTradeFlowDeployments(
        CommonConfig memory commonConfig,
        TradeFlowContracts memory contracts_
    ) internal view {
        console2.log("========== Trade Flow Demo ==========");
        console2.log("MockToken:", address(contracts_.mockToken));
        console2.log("Initial receiver:", commonConfig.initialReceiver);
        console2.log("=====================================");
    }
}
