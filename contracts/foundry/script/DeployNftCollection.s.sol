// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";

import {LaunchERC721Collection} from "../src/token-launch-demo/LaunchERC721Collection.sol";

contract DeployNftCollection is Script {
    function run() external returns (LaunchERC721Collection collection) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address owner = vm.envAddress("INITIAL_RECEIVER");

        string memory name = "Launch Demo NFT";
        string memory symbol = "LDNFT";
        string memory contractURI = "ipfs://demo-collection-metadata";
        string memory baseTokenURI = "ipfs://demo-token-metadata/";
        uint256 maxSupply = 10_000;

        vm.startBroadcast(deployerPrivateKey);

        collection = new LaunchERC721Collection({
            name_: name,
            symbol_: symbol,
            contractURI_: contractURI,
            baseTokenURI_: baseTokenURI,
            maxSupply_: maxSupply,
            owner_: owner
        });

        vm.stopBroadcast();

        console2.log(
            "LaunchERC721Collection deployed at:",
            address(collection)
        );
        console2.log("Name:", name);
        console2.log("Symbol:", symbol);
        console2.log("Owner:", owner);
        console2.log("Contract URI:", contractURI);
        console2.log("Base Token URI:", baseTokenURI);
        console2.log("Max Supply:", maxSupply);
    }
}
