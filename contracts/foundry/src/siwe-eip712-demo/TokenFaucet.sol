// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract TokenFaucet is Ownable {
    IERC20 public immutable token;
    uint256 public immutable claimAmount;
    uint256 public immutable cooldown;

    mapping(address => uint256) public lastClaimedAt;

    event Claimed(address indexed user, uint256 amount, uint256 claimedAt);

    error CooldownNotFinished(uint256 nextClaimAt);
    error FaucetInsufficientBalance(uint256 balance, uint256 needed);

    constructor(
        address token_,
        uint256 claimAmount_,
        uint256 cooldown_,
        address initialOwner
    ) Ownable(initialOwner) {
        token = IERC20(token_);
        claimAmount = claimAmount_;
        cooldown = cooldown_;
    }

    function canClaim(address user) public view returns (bool) {
        return block.timestamp >= lastClaimedAt[user] + cooldown;
    }

    function claim() external {
        uint256 nextClaimAt = lastClaimedAt[msg.sender] + cooldown;

        if (block.timestamp < nextClaimAt) {
            revert CooldownNotFinished(nextClaimAt);
        }

        uint256 faucetBalance = token.balanceOf(address(this));
        if (faucetBalance < claimAmount) {
            revert FaucetInsufficientBalance(faucetBalance, claimAmount);
        }

        lastClaimedAt[msg.sender] = block.timestamp;

        bool ok = token.transfer(msg.sender, claimAmount);
        require(ok, "TOKEN_TRANSFER_FAILED");

        emit Claimed(msg.sender, claimAmount, block.timestamp);
    }
}
