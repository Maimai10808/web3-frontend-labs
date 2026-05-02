// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";

contract LaunchERC20 is ERC20, Ownable {
    string public metadataURI;
    uint256 public immutable maxSupply;

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 maxSupply_,
        string memory metadataURI_,
        address owner_
    ) ERC20(name_, symbol_) Ownable(owner_) {
        require(bytes(name_).length > 0, "NAME_REQUIRED");
        require(bytes(symbol_).length > 0, "SYMBOL_REQUIRED");
        require(bytes(metadataURI_).length > 0, "METADATA_URI_REQUIRED");
        require(owner_ != address(0), "OWNER_REQUIRED");
        require(maxSupply_ > 0, "MAX_SUPPLY_REQUIRED");

        maxSupply = maxSupply_;
        metadataURI = metadataURI_;

        _mint(owner_, maxSupply_);
    }

    function setMetadataURI(
        string calldata nextMetadataURI
    ) external onlyOwner {
        require(bytes(nextMetadataURI).length > 0, "METADATA_URI_REQUIRED");
        metadataURI = nextMetadataURI;
    }
}
