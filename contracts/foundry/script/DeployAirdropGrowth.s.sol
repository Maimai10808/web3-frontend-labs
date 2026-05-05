// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {RewardToken} from "../src/airdrop-growth-demo/RewardToken.sol";
import {AirdropGrowthClaim} from "../src/airdrop-growth-demo/AirdropGrowthClaim.sol";

contract DeployAirdropGrowth is Script {
    uint256 internal constant REWARD_AMOUNT = 100 ether;
    uint256 internal constant INITIAL_REWARD_POOL = 1_000_000 ether;
    uint256 internal constant CLAIM_DURATION = 30 days;

    function run()
        external
        returns (RewardToken rewardToken, AirdropGrowthClaim airdropGrowthClaim)
    {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        uint256 claimDeadline = block.timestamp + CLAIM_DURATION;

        vm.startBroadcast(deployerPrivateKey);

        rewardToken = new RewardToken("Airdrop Reward Token", "ART", deployer);

        airdropGrowthClaim = new AirdropGrowthClaim(
            address(rewardToken),
            REWARD_AMOUNT,
            claimDeadline,
            deployer
        );

        rewardToken.mint(address(airdropGrowthClaim), INITIAL_REWARD_POOL);

        vm.stopBroadcast();

        console2.log("RewardToken:", address(rewardToken));
        console2.log("AirdropGrowthClaim:", address(airdropGrowthClaim));
        console2.log("Reward amount:", REWARD_AMOUNT);
        console2.log("Initial reward pool:", INITIAL_REWARD_POOL);
        console2.log("Claim deadline:", claimDeadline);
    }
}
