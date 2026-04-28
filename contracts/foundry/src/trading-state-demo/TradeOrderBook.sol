// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract TradeOrderBook {
    enum Side {
        Buy,
        Sell
    }

    enum OrderStatus {
        None,
        Submitted,
        Cancelled,
        Filled
    }

    struct TradeOrder {
        address trader;
        Side side;
        address baseToken;
        address quoteToken;
        uint256 price;
        uint256 amount;
        uint256 tif;
        uint256 nonce;
        uint256 deadline;
    }

    struct StoredOrder {
        address trader;
        Side side;
        address baseToken;
        address quoteToken;
        uint256 price;
        uint256 amount;
        uint256 tif;
        uint256 nonce;
        uint256 deadline;
        OrderStatus status;
        uint256 createdAt;
        uint256 updatedAt;
    }

    bytes32 public constant TRADE_ORDER_TYPEHASH =
        keccak256(
            "TradeOrder(address trader,uint8 side,address baseToken,address quoteToken,uint256 price,uint256 amount,uint256 tif,uint256 nonce,uint256 deadline)"
        );

    bytes32 public immutable DOMAIN_SEPARATOR;

    address public immutable owner;

    mapping(bytes32 orderId => StoredOrder order) private orders;
    mapping(address trader => uint256 nonce) public nonces;

    event OrderSubmitted(
        bytes32 indexed orderId,
        address indexed trader,
        Side side,
        address indexed baseToken,
        address quoteToken,
        uint256 price,
        uint256 amount,
        uint256 tif,
        uint256 nonce,
        uint256 deadline
    );

    event OrderCancelled(bytes32 indexed orderId, address indexed trader);

    event OrderFilled(bytes32 indexed orderId, address indexed trader);

    error NotOwner();
    error InvalidTrader();
    error InvalidDeadline();
    error InvalidNonce();
    error InvalidSignature();
    error OrderAlreadyExists();
    error OrderNotFound();
    error NotOrderTrader();
    error OrderNotSubmitted();

    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert NotOwner();
        }
        _;
    }

    constructor() {
        owner = msg.sender;

        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256(
                    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                ),
                keccak256(bytes("TradeOrderBook")),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }

    function submitOrder(
        TradeOrder calldata order,
        bytes calldata signature
    ) external returns (bytes32 orderId) {
        if (order.trader == address(0)) {
            revert InvalidTrader();
        }

        if (block.timestamp > order.deadline) {
            revert InvalidDeadline();
        }

        uint256 expectedNonce = nonces[order.trader];

        if (order.nonce != expectedNonce) {
            revert InvalidNonce();
        }

        orderId = getOrderId(order);

        if (orders[orderId].status != OrderStatus.None) {
            revert OrderAlreadyExists();
        }

        address signer = recoverSigner(getTypedDataHash(order), signature);

        if (signer != order.trader) {
            revert InvalidSignature();
        }

        nonces[order.trader] = expectedNonce + 1;

        orders[orderId] = StoredOrder({
            trader: order.trader,
            side: order.side,
            baseToken: order.baseToken,
            quoteToken: order.quoteToken,
            price: order.price,
            amount: order.amount,
            tif: order.tif,
            nonce: order.nonce,
            deadline: order.deadline,
            status: OrderStatus.Submitted,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        emit OrderSubmitted({
            orderId: orderId,
            trader: order.trader,
            side: order.side,
            baseToken: order.baseToken,
            quoteToken: order.quoteToken,
            price: order.price,
            amount: order.amount,
            tif: order.tif,
            nonce: order.nonce,
            deadline: order.deadline
        });
    }

    function cancelOrder(bytes32 orderId) external {
        StoredOrder storage order = orders[orderId];

        if (order.status == OrderStatus.None) {
            revert OrderNotFound();
        }

        if (order.trader != msg.sender) {
            revert NotOrderTrader();
        }

        if (order.status != OrderStatus.Submitted) {
            revert OrderNotSubmitted();
        }

        order.status = OrderStatus.Cancelled;
        order.updatedAt = block.timestamp;

        emit OrderCancelled(orderId, msg.sender);
    }

    function markOrderFilled(bytes32 orderId) external onlyOwner {
        StoredOrder storage order = orders[orderId];

        if (order.status == OrderStatus.None) {
            revert OrderNotFound();
        }

        if (order.status != OrderStatus.Submitted) {
            revert OrderNotSubmitted();
        }

        order.status = OrderStatus.Filled;
        order.updatedAt = block.timestamp;

        emit OrderFilled(orderId, order.trader);
    }

    function getOrder(
        bytes32 orderId
    ) external view returns (StoredOrder memory) {
        return orders[orderId];
    }

    function getOrderId(
        TradeOrder calldata order
    ) public pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    order.trader,
                    order.side,
                    order.baseToken,
                    order.quoteToken,
                    order.price,
                    order.amount,
                    order.tif,
                    order.nonce,
                    order.deadline
                )
            );
    }

    function getStructHash(
        TradeOrder calldata order
    ) public pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    TRADE_ORDER_TYPEHASH,
                    order.trader,
                    order.side,
                    order.baseToken,
                    order.quoteToken,
                    order.price,
                    order.amount,
                    order.tif,
                    order.nonce,
                    order.deadline
                )
            );
    }

    function getTypedDataHash(
        TradeOrder calldata order
    ) public view returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    "\x19\x01",
                    DOMAIN_SEPARATOR,
                    getStructHash(order)
                )
            );
    }

    function recoverSigner(
        bytes32 digest,
        bytes calldata signature
    ) public pure returns (address) {
        if (signature.length != 65) {
            revert InvalidSignature();
        }

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := calldataload(signature.offset)
            s := calldataload(add(signature.offset, 32))
            v := byte(0, calldataload(add(signature.offset, 64)))
        }

        if (v < 27) {
            v += 27;
        }

        if (v != 27 && v != 28) {
            revert InvalidSignature();
        }

        address signer = ecrecover(digest, v, r, s);

        if (signer == address(0)) {
            revert InvalidSignature();
        }

        return signer;
    }
}
