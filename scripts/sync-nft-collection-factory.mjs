import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();

const foundryDir = path.join(rootDir, "contracts/foundry");
const contractsPackageDir = path.join(
  rootDir,
  "packages/contracts/src/token-launch-demo",
);

const chainName = "local";
const chainId = 31337;
const deployScript = "DeployNftCollectionFactory.s.sol";

const broadcastPath = path.join(
  foundryDir,
  "broadcast",
  deployScript,
  String(chainId),
  "run-latest.json",
);

const contracts = [
  {
    name: "LaunchERC721Factory",
    artifactFile: "LaunchERC721Factory.sol",
    exportName: "launchERC721Factory",
  },
  {
    name: "LaunchERC721Collection",
    artifactFile: "LaunchERC721Collection.sol",
    exportName: "launchERC721Collection",
    abiOnly: true,
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
  fs.writeFileSync(filePath, content);
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

function generateContractsFile({ deployments, abiExports, deploymentMeta }) {
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
      `export const ${exportName}Deployment = ${JSON.stringify(deployment, null, 2)} as const;`,
    );
    lines.push("");
  }

  lines.push(
    `export const nftCollectionFactoryDeploymentMeta = ${JSON.stringify(
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

    if (contract.abiOnly) {
      console.log(`Synced ABI only: ${contract.name}`);
      continue;
    }

    const deployed = findDeployedContract(broadcastJson, contract.name);

    if (!deployed) {
      throw new Error(`Deployed contract not found: ${contract.name}`);
    }

    deployments[contract.exportName] = {
      contractName: contract.name,
      address: deployed.address,
      transactionHash: deployed.transactionHash,
    };

    console.log(`Synced ${contract.name}: ${deployed.address}`);
  }

  writeFile(
    path.join(contractsPackageDir, "nft-collection-factory.ts"),
    generateContractsFile({
      deployments,
      abiExports,
      deploymentMeta,
    }),
  );

  writeFile(
    path.join(contractsPackageDir, "nft-collection-factory.meta.json"),
    JSON.stringify(
      generateDeploymentJson({
        deployments,
        deploymentMeta,
      }),
      null,
      2,
    ),
  );

  console.log("NFT collection factory contracts synced.");
}

main();
