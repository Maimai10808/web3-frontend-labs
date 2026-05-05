// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract AirdropGrowthClaim is AccessControl {
    bytes32 public constant CAMPAIGN_ADMIN_ROLE =
        keccak256("CAMPAIGN_ADMIN_ROLE");

    IERC20 public immutable rewardToken;
    uint256 public rewardAmount;
    uint256 public claimDeadline;

    mapping(address => bool) public eligibleUsers;
    mapping(address => bool) public hasClaimed;

    event RewardClaimed(address indexed user, uint256 amount);
    event EligibilityUpdated(address indexed user, bool eligible);
    event RewardAmountUpdated(uint256 nextRewardAmount);
    event ClaimDeadlineUpdated(uint256 nextClaimDeadline);
    event CampaignFunded(address indexed funder, uint256 amount);
    event CampaignWithdrawn(address indexed recipient, uint256 amount);

    error NotEligible();
    error AlreadyClaimed();
    error ClaimExpired();
    error RewardAmountRequired();
    error ClaimDeadlineRequired();
    error RewardTransferFailed();
    error InsufficientRewardBalance();
    error RecipientRequired();

    constructor(
        address rewardToken_,
        uint256 rewardAmount_,
        uint256 claimDeadline_,
        address admin_
    ) {
        require(rewardToken_ != address(0), "REWARD_TOKEN_REQUIRED");
        require(admin_ != address(0), "ADMIN_REQUIRED");

        if (rewardAmount_ == 0) revert RewardAmountRequired();
        if (claimDeadline_ <= block.timestamp) revert ClaimDeadlineRequired();

        rewardToken = IERC20(rewardToken_);
        rewardAmount = rewardAmount_;
        claimDeadline = claimDeadline_;

        _grantRole(DEFAULT_ADMIN_ROLE, admin_);
        _grantRole(CAMPAIGN_ADMIN_ROLE, admin_);
    }

    function claim() external {
        if (block.timestamp > claimDeadline) revert ClaimExpired();
        if (!eligibleUsers[msg.sender]) revert NotEligible();
        if (hasClaimed[msg.sender]) revert AlreadyClaimed();

        uint256 balance = rewardToken.balanceOf(address(this));
        if (balance < rewardAmount) revert InsufficientRewardBalance();

        hasClaimed[msg.sender] = true;

        bool ok = rewardToken.transfer(msg.sender, rewardAmount);
        if (!ok) revert RewardTransferFailed();

        emit RewardClaimed(msg.sender, rewardAmount);
    }

    function setEligibleUser(
        address user,
        bool eligible
    ) external onlyRole(CAMPAIGN_ADMIN_ROLE) {
        require(user != address(0), "USER_REQUIRED");

        eligibleUsers[user] = eligible;
        emit EligibilityUpdated(user, eligible);
    }

    function setEligibleUsers(
        address[] calldata users,
        bool eligible
    ) external onlyRole(CAMPAIGN_ADMIN_ROLE) {
        uint256 length = users.length;

        for (uint256 i = 0; i < length; i++) {
            address user = users[i];
            if (user == address(0)) {
                continue;
            }

            eligibleUsers[user] = eligible;
            emit EligibilityUpdated(user, eligible);
        }
    }

    function setRewardAmount(
        uint256 nextRewardAmount
    ) external onlyRole(CAMPAIGN_ADMIN_ROLE) {
        if (nextRewardAmount == 0) revert RewardAmountRequired();

        rewardAmount = nextRewardAmount;
        emit RewardAmountUpdated(nextRewardAmount);
    }

    function setClaimDeadline(
        uint256 nextClaimDeadline
    ) external onlyRole(CAMPAIGN_ADMIN_ROLE) {
        if (nextClaimDeadline <= block.timestamp)
            revert ClaimDeadlineRequired();

        claimDeadline = nextClaimDeadline;
        emit ClaimDeadlineUpdated(nextClaimDeadline);
    }

    function withdrawUnusedRewards(
        address recipient,
        uint256 amount
    ) external onlyRole(CAMPAIGN_ADMIN_ROLE) {
        if (recipient == address(0)) revert RecipientRequired();

        bool ok = rewardToken.transfer(recipient, amount);
        if (!ok) revert RewardTransferFailed();

        emit CampaignWithdrawn(recipient, amount);
    }

    function getClaimStatus(
        address user
    )
        external
        view
        returns (
            bool eligible,
            bool claimed,
            bool expired,
            uint256 currentRewardAmount,
            uint256 deadline
        )
    {
        return (
            eligibleUsers[user],
            hasClaimed[user],
            block.timestamp > claimDeadline,
            rewardAmount,
            claimDeadline
        );
    }
}
