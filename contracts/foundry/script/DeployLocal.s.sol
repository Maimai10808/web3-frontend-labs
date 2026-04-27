// contracts/foundry/script/DeployLocal.s.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {TradeFlowDeployment} from "./deployments/TradeFlowDeployment.s.sol";
import {NftDemoDeployment} from "./deployments/NftDemoDeployment.s.sol";

contract DeployLocal is TradeFlowDeployment, NftDemoDeployment {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        CommonConfig memory commonConfig = loadCommonConfig();

        vm.startBroadcast(deployerPrivateKey);

        TradeFlowContracts memory tradeFlowContracts = deployTradeFlowDemo(
            commonConfig
        );

        NftDemoContracts memory nftDemoContracts = deployNftDemo(commonConfig);

        // 后面新增 Demo，只需要继续加这种块：
        //
        // SiweEip712Contracts memory siweContracts =
        //     deploySiweEip712Demo(commonConfig);
        //
        // AirdropTaskContracts memory airdropContracts =
        //     deployAirdropTaskDemo(commonConfig);

        vm.stopBroadcast();

        printTradeFlowDeployments(commonConfig, tradeFlowContracts);
        printNftDemoDeployments(commonConfig, nftDemoContracts);

        // 后面对应加：
        //
        // printSiweEip712Deployments(commonConfig, siweContracts);
        // printAirdropTaskDeployments(commonConfig, airdropContracts);
    }
}
