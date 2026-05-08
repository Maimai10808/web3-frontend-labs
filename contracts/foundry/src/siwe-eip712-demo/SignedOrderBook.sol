// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract SignedOrderBook is EIP712 {
    struct Order {
        address maker;
        address token;
        address recipient;
        uint256 amount;
        uint256 deadline;
        bytes32 nonce;
    }

    bytes32 public constant ORDER_TYPEHASH =
        keccak256(
            "Order(address maker,address token,address recipient,uint256 amount,uint256 deadline,bytes32 nonce)"
        );

    mapping(bytes32 => bool) public usedNonces;

    event OrderExecuted(
        address indexed maker,
        address indexed recipient,
        address indexed token,
        uint256 amount,
        bytes32 nonce
    );

    error ExpiredOrder(uint256 deadline);
    error UsedNonce(bytes32 nonce);
    error InvalidSigner(address recovered, address expected);
    error TransferFromFailed();

    constructor() EIP712("SignedOrderBook", "1") {}

    function hashOrder(Order calldata order) public view returns (bytes32) {
        bytes32 structHash = keccak256(
            abi.encode(
                ORDER_TYPEHASH,
                order.maker,
                order.token,
                order.recipient,
                order.amount,
                order.deadline,
                order.nonce
            )
        );

        return _hashTypedDataV4(structHash);
    }

    function recoverSigner(
        Order calldata order,
        bytes calldata signature
    ) public view returns (address) {
        return ECDSA.recover(hashOrder(order), signature);
    }

    function executeOrder(
        Order calldata order,
        bytes calldata signature
    ) external {
        if (block.timestamp > order.deadline) {
            revert ExpiredOrder(order.deadline);
        }

        if (usedNonces[order.nonce]) {
            revert UsedNonce(order.nonce);
        }

        address recovered = recoverSigner(order, signature);
        if (recovered != order.maker) {
            revert InvalidSigner(recovered, order.maker);
        }

        usedNonces[order.nonce] = true;

        bool ok = IERC20(order.token).transferFrom(
            order.maker,
            order.recipient,
            order.amount
        );

        if (!ok) {
            revert TransferFromFailed();
        }

        emit OrderExecuted(
            order.maker,
            order.recipient,
            order.token,
            order.amount,
            order.nonce
        );
    }
}
