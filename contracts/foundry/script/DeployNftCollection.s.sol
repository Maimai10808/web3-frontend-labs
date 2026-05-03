// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {LaunchERC721Collection} from "../src/token-launch-demo/LaunchERC721Collection.sol";

contract DeployNftCollection is Script {
    LaunchERC721Collection public collection;

    function run() external returns (LaunchERC721Collection) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address owner = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        collection = new LaunchERC721Collection({
            name_: "Demo NFT Collection",
            symbol_: "DNFT",
            contractURI_: "ipfs://demo-collection-metadata",
            baseTokenURI_: "ipfs://demo-token-metadata/",
            maxSupply_: 1000,
            mintPrice_: 0.01 ether,
            owner_: owner
        });

        vm.stopBroadcast();

        return collection;
    }
}
