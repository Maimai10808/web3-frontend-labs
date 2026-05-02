// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {LaunchERC20} from "./LaunchERC20.sol";

contract TokenFactory {
    struct TokenLaunchConfig {
        string name;
        string symbol;
        uint256 maxSupply;
        string metadataURI;
    }

    struct TokenLaunchRecord {
        address token;
        address creator;
        string name;
        string symbol;
        string metadataURI;
        uint256 maxSupply;
        uint256 createdAt;
    }

    TokenLaunchRecord[] private _launchRecords;
    mapping(address => TokenLaunchRecord) public launchRecordByToken;
    mapping(address => address[]) public tokensByCreator;

    event TokenLaunched(
        address indexed creator,
        address indexed token,
        string name,
        string symbol,
        string metadataURI,
        uint256 maxSupply
    );

    function createToken(
        TokenLaunchConfig calldata config
    ) external returns (address tokenAddress) {
        require(bytes(config.name).length > 0, "NAME_REQUIRED");
        require(bytes(config.symbol).length > 0, "SYMBOL_REQUIRED");
        require(bytes(config.metadataURI).length > 0, "METADATA_URI_REQUIRED");
        require(config.maxSupply > 0, "MAX_SUPPLY_REQUIRED");

        LaunchERC20 token = new LaunchERC20(
            config.name,
            config.symbol,
            config.maxSupply,
            config.metadataURI,
            msg.sender
        );

        tokenAddress = address(token);

        TokenLaunchRecord memory record = TokenLaunchRecord({
            token: tokenAddress,
            creator: msg.sender,
            name: config.name,
            symbol: config.symbol,
            metadataURI: config.metadataURI,
            maxSupply: config.maxSupply,
            createdAt: block.timestamp
        });

        _launchRecords.push(record);
        launchRecordByToken[tokenAddress] = record;
        tokensByCreator[msg.sender].push(tokenAddress);

        emit TokenLaunched(
            msg.sender,
            tokenAddress,
            config.name,
            config.symbol,
            config.metadataURI,
            config.maxSupply
        );
    }

    function getLaunchCount() external view returns (uint256) {
        return _launchRecords.length;
    }

    function getLaunchRecord(
        uint256 index
    ) external view returns (TokenLaunchRecord memory) {
        return _launchRecords[index];
    }

    function getCreatorTokens(
        address creator
    ) external view returns (address[] memory) {
        return tokensByCreator[creator];
    }
}
