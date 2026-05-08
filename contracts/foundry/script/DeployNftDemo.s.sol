// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {DemoNFT} from "../src/nft-demo/DemoNFT.sol";

contract DeployNftDemo is Script {
    function run() external returns (DemoNFT demoNFT) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        demoNFT = new DemoNFT({
            name_: "Demo NFT",
            symbol_: "DNFT",
            baseTokenURI_: "ipfs://bafy-demo-metadata/",
            initialOwner: deployer
        });

        demoNFT.batchMint(deployer, 3);

        vm.stopBroadcast();

        console2.log("DemoNFT deployed at:", address(demoNFT));
        console2.log("Initial owner:", deployer);
        console2.log("Minted to:", deployer);
    }
}
