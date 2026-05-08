import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();

const foundryDir = path.join(rootDir, "contracts/foundry");
const contractsPackageDir = path.join(
  rootDir,
  "packages/contracts/src/nft-demo",
);

const chainName = "local";
const chainId = 31337;
const deployScript = "DeployNftDemo.s.sol";

const contracts = [
  {
    name: "DemoNFT",
    artifactFile: "DemoNFT.sol",
    exportName: "demoNFT",
  },
];

const broadcastPath = path.join(
  foundryDir,
  "broadcast",
  deployScript,
  String(chainId),
  "run-latest.json",
);

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
  const tx = (broadcastJson.transactions ?? []).find((item) => {
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
  const lines = ["/* eslint-disable */", ""];

  for (const contract of contracts) {
    const artifact = readArtifact(contract);
    const deployed = findDeployedContract(broadcastJson, contract.name);

    if (!deployed) {
      throw new Error(
        `Deployed contract not found in broadcast: ${contract.name}`,
      );
    }

    lines.push(generateAbiExport(contract.exportName, artifact.abi));

    deployments[contract.exportName] = {
      contractName: contract.name,
      address: deployed.address,
      transactionHash: deployed.transactionHash,
    };

    lines.push(
      `export const ${contract.exportName}Address = "${deployed.address}" as const;`,
    );
    lines.push("");

    lines.push(
      `export const ${contract.exportName}Deployment = ${JSON.stringify(
        deployments[contract.exportName],
        null,
        2,
      )} as const;`,
    );
    lines.push("");

    console.log(`Synced ${contract.name}: ${deployed.address}`);
  }

  lines.push(
    `export const nftDemoDeploymentMeta = ${JSON.stringify(
      deploymentMeta,
      null,
      2,
    )} as const;`,
  );
  lines.push("");

  writeFile(path.join(contractsPackageDir, "contracts.ts"), lines.join("\n"));
  writeFile(path.join(contractsPackageDir, "index.ts"), generateIndexFile());

  writeFile(
    path.join(contractsPackageDir, "deployment.meta.json"),
    JSON.stringify(
      {
        ...deploymentMeta,
        contracts: deployments,
      },
      null,
      2,
    ),
  );

  console.log("NFT demo contracts synced.");
}

main();
