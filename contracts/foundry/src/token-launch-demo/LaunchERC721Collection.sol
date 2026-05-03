// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract LaunchERC721Collection is ERC721Enumerable, AccessControl {
    using Strings for uint256;

    string public constant ROLE_MINTER_STR = "ROLE_MINTER";
    bytes32 public constant ROLE_MINTER = keccak256(bytes(ROLE_MINTER_STR));

    string public constant ROLE_MINTER_ADMIN_STR = "ROLE_MINTER_ADMIN";
    bytes32 public constant ROLE_MINTER_ADMIN =
        keccak256(bytes(ROLE_MINTER_ADMIN_STR));

    string public contractURI;
    string private _baseTokenURI;

    uint256 public immutable maxSupply;
    uint256 public nextTokenId;

    mapping(uint256 => string) private _customTokenURIs;

    event CollectionMinted(
        address indexed operator,
        address indexed to,
        uint256 indexed tokenId
    );

    event CollectionBurned(uint256 indexed tokenId);

    event ContractURIUpdated(string nextContractURI);

    event BaseTokenURIUpdated(string nextBaseTokenURI);

    event CustomTokenURIUpdated(uint256 indexed tokenId, string nextTokenURI);

    error ContractURIRequired();
    error BaseTokenURIRequired();
    error MaxSupplyRequired();
    error MaxSupplyReached();
    error MinterRoleRequired();
    error NonexistentToken();
    error OwnerRequired();

    constructor(
        string memory name_,
        string memory symbol_,
        string memory contractURI_,
        string memory baseTokenURI_,
        uint256 maxSupply_,
        address owner_
    ) ERC721(name_, symbol_) {
        if (bytes(contractURI_).length == 0) revert ContractURIRequired();
        if (bytes(baseTokenURI_).length == 0) revert BaseTokenURIRequired();
        if (maxSupply_ == 0) revert MaxSupplyRequired();
        if (owner_ == address(0)) revert OwnerRequired();

        contractURI = contractURI_;
        _baseTokenURI = baseTokenURI_;
        maxSupply = maxSupply_;
        nextTokenId = 1;

        _setRoleAdmin(ROLE_MINTER, ROLE_MINTER_ADMIN);

        _grantRole(DEFAULT_ADMIN_ROLE, owner_);
        _grantRole(ROLE_MINTER_ADMIN, owner_);
        _grantRole(ROLE_MINTER, owner_);
    }

    function mintTo(address to) external returns (uint256 tokenId) {
        if (!hasRole(ROLE_MINTER, msg.sender)) revert MinterRoleRequired();
        if (nextTokenId > maxSupply) revert MaxSupplyReached();

        tokenId = nextTokenId;
        nextTokenId += 1;

        _safeMint(to, tokenId);

        emit CollectionMinted(msg.sender, to, tokenId);
    }

    function mintToWithURI(
        address to,
        string calldata nextTokenURI
    ) external returns (uint256 tokenId) {
        if (!hasRole(ROLE_MINTER, msg.sender)) revert MinterRoleRequired();
        if (nextTokenId > maxSupply) revert MaxSupplyReached();

        tokenId = nextTokenId;
        nextTokenId += 1;

        _safeMint(to, tokenId);

        if (bytes(nextTokenURI).length > 0) {
            _customTokenURIs[tokenId] = nextTokenURI;
            emit CustomTokenURIUpdated(tokenId, nextTokenURI);
        }

        emit CollectionMinted(msg.sender, to, tokenId);
    }

    function burn(uint256 tokenId) external {
        address tokenOwner = _ownerOf(tokenId);

        if (tokenOwner == address(0)) {
            revert NonexistentToken();
        }

        if (!_isAuthorized(tokenOwner, msg.sender, tokenId)) {
            revert ERC721InsufficientApproval(msg.sender, tokenId);
        }

        _burn(tokenId);

        if (bytes(_customTokenURIs[tokenId]).length > 0) {
            delete _customTokenURIs[tokenId];
        }

        emit CollectionBurned(tokenId);
    }

    function setContractURI(
        string calldata nextContractURI
    ) external onlyRole(ROLE_MINTER_ADMIN) {
        if (bytes(nextContractURI).length == 0) revert ContractURIRequired();

        contractURI = nextContractURI;

        emit ContractURIUpdated(nextContractURI);
    }

    function setBaseTokenURI(
        string calldata nextBaseTokenURI
    ) external onlyRole(ROLE_MINTER_ADMIN) {
        if (bytes(nextBaseTokenURI).length == 0) revert BaseTokenURIRequired();

        _baseTokenURI = nextBaseTokenURI;

        emit BaseTokenURIUpdated(nextBaseTokenURI);
    }

    function setCustomTokenURI(
        uint256 tokenId,
        string calldata nextTokenURI
    ) external onlyRole(ROLE_MINTER_ADMIN) {
        if (_ownerOf(tokenId) == address(0)) {
            revert NonexistentToken();
        }

        _customTokenURIs[tokenId] = nextTokenURI;

        emit CustomTokenURIUpdated(tokenId, nextTokenURI);
    }

    function baseTokenURI() external view returns (string memory) {
        return _baseTokenURI;
    }

    function customTokenURI(
        uint256 tokenId
    ) external view returns (string memory) {
        if (_ownerOf(tokenId) == address(0)) {
            revert NonexistentToken();
        }

        return _customTokenURIs[tokenId];
    }

    function totalMinted() external view returns (uint256) {
        return nextTokenId - 1;
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        if (_ownerOf(tokenId) == address(0)) {
            revert NonexistentToken();
        }

        string memory currentCustomTokenURI = _customTokenURIs[tokenId];

        if (bytes(currentCustomTokenURI).length > 0) {
            return currentCustomTokenURI;
        }

        return string(abi.encodePacked(_baseTokenURI, tokenId.toString()));
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721Enumerable, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
