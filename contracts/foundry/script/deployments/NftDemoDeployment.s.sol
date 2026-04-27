// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {console2} from "forge-std/console2.sol";

import {CommonConfigLoader} from "../config/CommonConfig.s.sol";
import {DemoNFT} from "../../src/nft-demo/DemoNFT.sol";

abstract contract NftDemoDeployment is CommonConfigLoader {
    struct NftDemoContracts {
        DemoNFT demoNFT;
    }

    function deployNftDemo(
        CommonConfig memory commonConfig
    ) internal returns (NftDemoContracts memory contracts_) {
        contracts_.demoNFT = deployDemoNFT({
            name: "Demo NFT",
            symbol: "DNFT",
            baseTokenURI: "ipfs://bafy-demo-metadata/",
            initialOwner: commonConfig.initialReceiver
        });

        contracts_.demoNFT.batchMint(commonConfig.initialReceiver, 3);
    }

    function deployDemoNFT(
        string memory name,
        string memory symbol,
        string memory baseTokenURI,
        address initialOwner
    ) internal returns (DemoNFT nft) {
        nft = new DemoNFT({
            name_: name,
            symbol_: symbol,
            baseTokenURI_: baseTokenURI,
            initialOwner: initialOwner
        });
    }

    function printNftDemoDeployments(
        CommonConfig memory commonConfig,
        NftDemoContracts memory contracts_
    ) internal view {
        console2.log("========== NFT Demo ==========");
        console2.log("DemoNFT:", address(contracts_.demoNFT));
        console2.log("Initial owner:", commonConfig.initialReceiver);
        console2.log("Minted to:", commonConfig.initialReceiver);
        console2.log("================================");
    }
}
