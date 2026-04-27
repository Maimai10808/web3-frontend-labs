# Contracts Workspace

这个目录用于管理本项目中所有 Demo 相关的智能合约、部署脚本、部署结果同步逻辑，以及给前端消费的 ABI / 地址导出。

整体目标是：

1. 合约开发集中在 `contracts/foundry`
2. 每个 Demo 的合约按模块拆分
3. 每个 Demo 的部署逻辑单独维护
4. 本地部署统一从 `DeployLocal.s.sol` 入口执行
5. 每次部署完成后，自动同步 ABI、合约地址、交易哈希到 `packages/contracts`
6. Next.js 前端只从 `packages/contracts` 读取链上配置，不直接读取 Foundry 产物

---

## 目录结构

```txt
web3-frontend-labs/
  contracts/
    README.md

    foundry/
      foundry.toml
      .env

      src/
        trade-flow-demo/
          MockToken.sol

        nft-demo/
          DemoNFT.sol

        siwe-eip712-demo/
          ...

        airdrop-task-demo/
          ...

      script/
        DeployLocal.s.sol

        config/
          CommonConfig.s.sol

        deployments/
          TradeFlowDeployment.s.sol
          NftDemoDeployment.s.sol
          SiweEip712Deployment.s.sol
          AirdropTaskDeployment.s.sol

      broadcast/
        DeployLocal.s.sol/
          31337/
            run-latest.json

      out/
        ...

  scripts/
    sync-contracts.mjs

  packages/
    contracts/
      package.json
      src/
        abis/
          MockToken.ts
          DemoNFT.ts

        deployments/
          local.ts

        addresses.ts
        index.ts

  apps/
    trade-flow-demo/
      ...
```

## 核心设计原则

1. src/xxx-demo/ 放每个 Demo 的合约

每个 Demo 的合约单独放一个目录，避免所有合约堆在 src/ 根目录下。

推荐结构：

```
contracts/foundry/src/
  trade-flow-demo/
    MockToken.sol

  nft-demo/
    DemoNFT.sol

  airdrop-task-demo/
    AirdropTask.sol
    RewardToken.sol

  siwe-eip712-demo/
    OrderVerifier.sol
```

这样以后 Demo 多了之后，合约边界会比较清晰。

例如：

```
// contracts/foundry/src/trade-flow-demo/MockToken.sol
```

表示这是 trade-flow-demo 使用的 Mock ERC20 合约。

```
// contracts/foundry/src/nft-demo/DemoNFT.sol

```

表示这是 nft-demo 使用的 ERC721 合约。

2. script/deployments/XxxDeployment.s.sol 放每个 Demo 的部署逻辑

每个 Demo 的部署逻辑单独放到 script/deployments/ 下面。

推荐结构：

```
contracts/foundry/script/deployments/
  TradeFlowDeployment.s.sol
  NftDemoDeployment.s.sol
  SiweEip712Deployment.s.sol
  AirdropTaskDeployment.s.sol
```

每个文件只负责一个 Demo 的部署逻辑。

例如：

```
// contracts/foundry/script/deployments/TradeFlowDeployment.s.sol
```

只负责部署交易流 Demo 需要的合约，比如 MockToken。

```
// contracts/foundry/script/deployments/NftDemoDeployment.s.sol
```

只负责部署 NFT Demo 需要的合约，比如 DemoNFT。

这种方式的好处是：

1. 每个 Demo 的部署逻辑独立
2. 后面新增 Demo 时不用改旧部署模块
3. DeployLocal.s.sol 不会越来越臃肿
4. 面试讲项目时，也能体现模块化部署设计

5. script/config/CommonConfig.s.sol 放公共环境变量配置

公共配置统一放到：

```
contracts/foundry/script/config/CommonConfig.s.sol
```

这个文件只做一件事：读取公共环境变量，并返回统一配置结构。

例如：

```
// contracts/foundry/script/config/CommonConfig.s.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script} from "forge-std/Script.sol";

contract CommonConfig is Script {
    struct Config {
        address initialReceiver;
    }

    function loadCommonConfig() internal view returns (Config memory config) {
        config = Config({
            initialReceiver: vm.envAddress("INITIAL_RECEIVER")
        });
    }
}
```

以后所有部署模块都可以复用这个公共配置。

.env 示例：

```
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
INITIAL_RECEIVER=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
LOCAL_RPC_URL=http://127.0.0.1:8545
```

注意：.env 不能提交到 GitHub。

⸻

4. script/DeployLocal.s.sol 只做总入口串联

DeployLocal.s.sol 是本地部署的总入口。

它不应该直接写大量合约部署细节，而是只负责串联每个 Demo 的部署模块。

推荐结构：

```
// contracts/foundry/script/DeployLocal.s.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script} from "forge-std/Script.sol";

import {CommonConfig} from "./config/CommonConfig.s.sol";
import {TradeFlowDeployment} from "./deployments/TradeFlowDeployment.s.sol";
import {NftDemoDeployment} from "./deployments/NftDemoDeployment.s.sol";

contract DeployLocal is Script, CommonConfig, TradeFlowDeployment, NftDemoDeployment {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        Config memory config = loadCommonConfig();

        vm.startBroadcast(deployerPrivateKey);

        TradeFlowContracts memory tradeFlowContracts = deployTradeFlowDemo(config);
        NftDemoContracts memory nftDemoContracts = deployNftDemo(config);

        vm.stopBroadcast();

        printTradeFlowDeployments(config, tradeFlowContracts);
        printNftDemoDeployments(config, nftDemoContracts);
    }
}
```

以后新增 Demo 时，只需要：

1. 新增 src/xxx-demo/YourContract.sol
2. 新增 script/deployments/XxxDeployment.s.sol
3. 在 DeployLocal.s.sol 里面继承并调用部署函数

例如：

```
import {AirdropTaskDeployment} from "./deployments/AirdropTaskDeployment.s.sol";

contract DeployLocal is Script, CommonConfig, TradeFlowDeployment, NftDemoDeployment, AirdropTaskDeployment {
    function run() external {
        ...

        AirdropTaskContracts memory airdropTaskContracts =
            deployAirdropTaskDemo(config);

        ...

        printAirdropTaskDeployments(config, airdropTaskContracts);
    }
}
```

## 最终链路

```

写合约
  ↓
contracts/foundry/src/xxx-demo/YourContract.sol
  ↓
写部署模块
  ↓
contracts/foundry/script/deployments/XxxDeployment.s.sol
  ↓
总入口串联
  ↓
contracts/foundry/script/DeployLocal.s.sol
  ↓
执行部署
  ↓
npm run deploy:local
  ↓
Foundry 生成 out/ 和 broadcast/
  ↓
scripts/sync-contracts.mjs 自动读取 ABI、地址、交易哈希
  ↓
生成 packages/contracts
  ↓
Next.js 前端通过 @web3-frontend-labs/contracts 使用 ABI 和地址

```
