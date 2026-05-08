import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();

const foundryDir = path.join(rootDir, "contracts/foundry");
const contractsPackageDir = path.join(
  rootDir,
  "packages/contracts/src/siwe-eip712-demo",
);

const chainName = "local";
const chainId = 31337;
const deployScript = "DeploySiweEip712Demo.s.sol";

const broadcastPath = path.join(
  foundryDir,
  "broadcast",
  deployScript,
  String(chainId),
  "run-latest.json",
);

const contracts = [
  {
    name: "DemoERC20",
    artifactFile: "DemoERC20.sol",
    exportName: "demoERC20",
  },
  {
    name: "TokenFaucet",
    artifactFile: "TokenFaucet.sol",
    exportName: "tokenFaucet",
  },
  {
    name: "SignedOrderBook",
    artifactFile: "SignedOrderBook.sol",
    exportName: "signedOrderBook",
  },
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, "utf8");
}

function findDeployedContract(broadcastJson, contractName) {
  const transactions = broadcastJson.transactions ?? [];

  const tx = transactions.find((item) => {
    return item.contractName === contractName && item.contractAddress;
  });

  if (!tx?.contractAddress) {
    return null;
  }

  return {
    address: tx.contractAddress,
    transactionHash: tx.hash,
  };
}

function readArtifact(contract) {
  const artifactPath = path.join(
    foundryDir,
    "out",
    contract.artifactFile,
    `${contract.name}.json`,
  );

  if (!fs.existsSync(artifactPath)) {
    throw new Error(`Artifact not found: ${artifactPath}`);
  }

  return readJson(artifactPath);
}

function generateAbiExport(exportName, abi) {
  return `export const ${exportName}Abi = ${JSON.stringify(abi, null, 2)} as const;\n`;
}

function generateMainContractsFile({
  deployments,
  abiExports,
  deploymentMeta,
}) {
  const lines = [];

  lines.push("/* eslint-disable */");
  lines.push("");

  for (const item of abiExports) {
    lines.push(item.content);
  }

  for (const [exportName, deployment] of Object.entries(deployments)) {
    lines.push(
      `export const ${exportName}Address = "${deployment.address}" as const;`,
    );
    lines.push("");
    lines.push(
      `export const ${exportName}Deployment = ${JSON.stringify(
        deployment,
        null,
        2,
      )} as const;`,
    );
    lines.push("");
  }

  lines.push(
    `export const signedOrderDemoDeploymentMeta = ${JSON.stringify(
      deploymentMeta,
      null,
      2,
    )} as const;`,
  );
  lines.push("");

  return lines.join("\n");
}

function generateDeploymentJson({ deployments, deploymentMeta }) {
  return {
    ...deploymentMeta,
    contracts: deployments,
  };
}

function generateIndexFile() {
  return `export * from "./contracts";\n`;
}

function main() {
  if (!fs.existsSync(broadcastPath)) {
    throw new Error(`Broadcast file not found: ${broadcastPath}`);
  }

  const broadcastJson = readJson(broadcastPath);

  const deploymentMeta = {
    deploymentId: `${chainName}-${chainId}-${Date.now()}`,
    chainId,
    networkName: chainName,
    deployScript,
    exportedAt: new Date().toISOString(),
  };

  const deployments = {};
  const abiExports = [];

  for (const contract of contracts) {
    const artifact = readArtifact(contract);

    abiExports.push({
      exportName: contract.exportName,
      content: generateAbiExport(contract.exportName, artifact.abi),
    });

    const deployed = findDeployedContract(broadcastJson, contract.name);

    if (!deployed) {
      throw new Error(
        `Deployed contract not found in broadcast: ${contract.name}`,
      );
    }

    deployments[contract.exportName] = {
      contractName: contract.name,
      address: deployed.address,
      transactionHash: deployed.transactionHash,
    };

    console.log(`Synced ${contract.name}: ${deployed.address}`);
  }

  writeFile(
    path.join(contractsPackageDir, "contracts.ts"),
    generateMainContractsFile({
      deployments,
      abiExports,
      deploymentMeta,
    }),
  );

  writeFile(
    path.join(contractsPackageDir, "deployment.meta.json"),
    JSON.stringify(
      generateDeploymentJson({
        deployments,
        deploymentMeta,
      }),
      null,
      2,
    ),
  );

  writeFile(path.join(contractsPackageDir, "index.ts"), generateIndexFile());

  console.log("Signed order demo contracts synced.");
}

main();
