// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract LaunchERC721Collection is ERC721Enumerable, AccessControl {
    using Strings for uint256;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant COLLECTION_ADMIN_ROLE =
        keccak256("COLLECTION_ADMIN_ROLE");

    string public contractURI;
    string private _baseTokenURI;

    uint256 public immutable maxSupply;
    uint256 public mintPrice;
    uint256 public nextTokenId;

    mapping(uint256 => string) private _customTokenURIs;

    event CollectionMinted(
        address indexed operator,
        address indexed to,
        uint256 indexed tokenId,
        uint256 paid
    );

    event CollectionBurned(uint256 indexed tokenId);
    event ContractURIUpdated(string nextContractURI);
    event BaseTokenURIUpdated(string nextBaseTokenURI);
    event CustomTokenURIUpdated(uint256 indexed tokenId, string nextTokenURI);
    event MintPriceUpdated(uint256 nextMintPrice);
    event Withdrawn(address indexed receiver, uint256 amount);

    error ContractURIRequired();
    error BaseTokenURIRequired();
    error MaxSupplyRequired();
    error MaxSupplyReached();
    error MintPriceNotPaid();
    error NonexistentToken();
    error OwnerRequired();
    error WithdrawFailed();

    constructor(
        string memory name_,
        string memory symbol_,
        string memory contractURI_,
        string memory baseTokenURI_,
        uint256 maxSupply_,
        uint256 mintPrice_,
        address owner_
    ) ERC721(name_, symbol_) {
        if (bytes(contractURI_).length == 0) revert ContractURIRequired();
        if (bytes(baseTokenURI_).length == 0) revert BaseTokenURIRequired();
        if (maxSupply_ == 0) revert MaxSupplyRequired();
        if (owner_ == address(0)) revert OwnerRequired();

        contractURI = contractURI_;
        _baseTokenURI = baseTokenURI_;
        maxSupply = maxSupply_;
        mintPrice = mintPrice_;
        nextTokenId = 1;

        _grantRole(DEFAULT_ADMIN_ROLE, owner_);
        _grantRole(COLLECTION_ADMIN_ROLE, owner_);
        _grantRole(MINTER_ROLE, owner_);
    }

    function mint() external payable returns (uint256 tokenId) {
        if (msg.value < mintPrice) revert MintPriceNotPaid();

        tokenId = _mintNext(msg.sender);

        emit CollectionMinted(msg.sender, msg.sender, tokenId, msg.value);
    }

    function mintWithURI(
        string calldata nextTokenURI
    ) external payable returns (uint256 tokenId) {
        if (msg.value < mintPrice) revert MintPriceNotPaid();

        tokenId = _mintNext(msg.sender);

        if (bytes(nextTokenURI).length > 0) {
            _customTokenURIs[tokenId] = nextTokenURI;
            emit CustomTokenURIUpdated(tokenId, nextTokenURI);
        }

        emit CollectionMinted(msg.sender, msg.sender, tokenId, msg.value);
    }

    function adminMintTo(
        address to
    ) external onlyRole(MINTER_ROLE) returns (uint256 tokenId) {
        tokenId = _mintNext(to);

        emit CollectionMinted(msg.sender, to, tokenId, 0);
    }

    function adminMintToWithURI(
        address to,
        string calldata nextTokenURI
    ) external onlyRole(MINTER_ROLE) returns (uint256 tokenId) {
        tokenId = _mintNext(to);

        if (bytes(nextTokenURI).length > 0) {
            _customTokenURIs[tokenId] = nextTokenURI;
            emit CustomTokenURIUpdated(tokenId, nextTokenURI);
        }

        emit CollectionMinted(msg.sender, to, tokenId, 0);
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
    ) external onlyRole(COLLECTION_ADMIN_ROLE) {
        if (bytes(nextContractURI).length == 0) revert ContractURIRequired();

        contractURI = nextContractURI;

        emit ContractURIUpdated(nextContractURI);
    }

    function setBaseTokenURI(
        string calldata nextBaseTokenURI
    ) external onlyRole(COLLECTION_ADMIN_ROLE) {
        if (bytes(nextBaseTokenURI).length == 0) revert BaseTokenURIRequired();

        _baseTokenURI = nextBaseTokenURI;

        emit BaseTokenURIUpdated(nextBaseTokenURI);
    }

    function setMintPrice(
        uint256 nextMintPrice
    ) external onlyRole(COLLECTION_ADMIN_ROLE) {
        mintPrice = nextMintPrice;

        emit MintPriceUpdated(nextMintPrice);
    }

    function setCustomTokenURI(
        uint256 tokenId,
        string calldata nextTokenURI
    ) external onlyRole(COLLECTION_ADMIN_ROLE) {
        if (_ownerOf(tokenId) == address(0)) {
            revert NonexistentToken();
        }

        _customTokenURIs[tokenId] = nextTokenURI;

        emit CustomTokenURIUpdated(tokenId, nextTokenURI);
    }

    function withdraw(
        address payable receiver
    ) external onlyRole(COLLECTION_ADMIN_ROLE) {
        if (receiver == address(0)) revert OwnerRequired();

        uint256 amount = address(this).balance;

        (bool success, ) = receiver.call{value: amount}("");
        if (!success) revert WithdrawFailed();

        emit Withdrawn(receiver, amount);
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

    function _mintNext(address to) internal returns (uint256 tokenId) {
        if (nextTokenId > maxSupply) revert MaxSupplyReached();

        tokenId = nextTokenId;
        nextTokenId += 1;

        _safeMint(to, tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721Enumerable, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
