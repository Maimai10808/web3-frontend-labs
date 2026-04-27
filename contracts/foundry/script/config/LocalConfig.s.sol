// contracts/foundry/script/config/LocalConfig.s.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script} from "forge-std/Script.sol";

abstract contract LocalConfig is Script {
    struct CommonConfig {
        address initialReceiver;
    }

    function loadCommonConfig()
        internal
        view
        returns (CommonConfig memory config)
    {
        config = CommonConfig({
            initialReceiver: vm.envAddress("INITIAL_RECEIVER")
        });
    }
}
