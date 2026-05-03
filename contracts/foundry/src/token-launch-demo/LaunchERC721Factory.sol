// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {LaunchERC721Collection} from "./LaunchERC721Collection.sol";

contract LaunchERC721Factory {
    struct CollectionConfig {
        string name;
        string symbol;
        string contractURI;
        string baseTokenURI;
        uint256 maxSupply;
        uint256 mintPrice;
    }

    struct CollectionRecord {
        address collection;
        address creator;
        string name;
        string symbol;
        string contractURI;
        string baseTokenURI;
        uint256 maxSupply;
        uint256 mintPrice;
        uint256 createdAt;
    }

    CollectionRecord[] private _collectionRecords;

    mapping(address => CollectionRecord) public collectionRecordByCollection;
    mapping(address => address[]) public collectionsByCreator;

    event CollectionCreated(
        address indexed creator,
        address indexed collection,
        string name,
        string symbol,
        string contractURI,
        string baseTokenURI,
        uint256 maxSupply,
        uint256 mintPrice
    );

    error NameRequired();
    error SymbolRequired();
    error ContractURIRequired();
    error BaseTokenURIRequired();
    error MaxSupplyRequired();

    function createCollection(
        CollectionConfig calldata config
    ) external returns (address collectionAddress) {
        if (bytes(config.name).length == 0) revert NameRequired();
        if (bytes(config.symbol).length == 0) revert SymbolRequired();
        if (bytes(config.contractURI).length == 0) {
            revert ContractURIRequired();
        }
        if (bytes(config.baseTokenURI).length == 0) {
            revert BaseTokenURIRequired();
        }
        if (config.maxSupply == 0) revert MaxSupplyRequired();

        LaunchERC721Collection collection = new LaunchERC721Collection(
            config.name,
            config.symbol,
            config.contractURI,
            config.baseTokenURI,
            config.maxSupply,
            config.mintPrice,
            msg.sender
        );

        collectionAddress = address(collection);

        CollectionRecord memory record = CollectionRecord({
            collection: collectionAddress,
            creator: msg.sender,
            name: config.name,
            symbol: config.symbol,
            contractURI: config.contractURI,
            baseTokenURI: config.baseTokenURI,
            maxSupply: config.maxSupply,
            mintPrice: config.mintPrice,
            createdAt: block.timestamp
        });

        _collectionRecords.push(record);
        collectionRecordByCollection[collectionAddress] = record;
        collectionsByCreator[msg.sender].push(collectionAddress);

        emit CollectionCreated(
            msg.sender,
            collectionAddress,
            config.name,
            config.symbol,
            config.contractURI,
            config.baseTokenURI,
            config.maxSupply,
            config.mintPrice
        );
    }

    function getCollectionCount() external view returns (uint256) {
        return _collectionRecords.length;
    }

    function getCollectionRecord(
        uint256 index
    ) external view returns (CollectionRecord memory) {
        return _collectionRecords[index];
    }

    function getCreatorCollections(
        address creator
    ) external view returns (address[] memory) {
        return collectionsByCreator[creator];
    }
}
