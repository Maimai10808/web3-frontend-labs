import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();

const foundryDir = path.join(rootDir, "contracts/foundry");
const outputDir = path.join(
  rootDir,
  "packages/contracts/src/token-launch-demo",
);

const chainName = "local";
const chainId = 31337;
const deployScript = "DeployNftCollection.s.sol";

const contractConfig = {
  name: "LaunchERC721Collection",
  artifactFile: "LaunchERC721Collection.sol",
  exportName: "launchERC721Collection",
};

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
  fs.writeFileSync(filePath, content);
}

function findDeployedContract(broadcastJson, contractName) {
  const transactions = broadcastJson.transactions ?? [];

  const tx = transactions.find((item) => {
    return item.contractName === contractName && item.contractAddress;
  });

  if (!tx?.contractAddress) {
    throw new Error(`Cannot find deployed contract: ${contractName}`);
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

function generateNftCollectionFile({ artifact, deployment, deploymentMeta }) {
  return `/* eslint-disable */

export const ${contractConfig.exportName}Abi = ${JSON.stringify(
    artifact.abi,
    null,
    2,
  )} as const;

export const ${contractConfig.exportName}Address = "${deployment.address}" as const;

export const ${contractConfig.exportName}Deployment = ${JSON.stringify(
    {
      contractName: contractConfig.name,
      address: deployment.address,
      transactionHash: deployment.transactionHash,
    },
    null,
    2,
  )} as const;

export const nftCollectionDeploymentMeta = ${JSON.stringify(
    deploymentMeta,
    null,
    2,
  )} as const;
`;
}

function generateMetaJson({ deployment, deploymentMeta }) {
  return {
    ...deploymentMeta,
    contracts: {
      [contractConfig.exportName]: {
        contractName: contractConfig.name,
        address: deployment.address,
        transactionHash: deployment.transactionHash,
      },
    },
  };
}

function upsertIndexFile() {
  const indexPath = path.join(outputDir, "index.ts");

  const nextLine = `export * from "./nft-collection";`;

  if (!fs.existsSync(indexPath)) {
    writeFile(indexPath, `${nextLine}\n`);
    return;
  }

  const current = fs.readFileSync(indexPath, "utf8");

  if (current.includes(nextLine)) {
    return;
  }

  writeFile(indexPath, `${current.trimEnd()}\n${nextLine}\n`);
}

function main() {
  if (!fs.existsSync(broadcastPath)) {
    throw new Error(`Broadcast file not found: ${broadcastPath}`);
  }

  const broadcastJson = readJson(broadcastPath);
  const artifact = readArtifact(contractConfig);
  const deployment = findDeployedContract(broadcastJson, contractConfig.name);

  const deploymentMeta = {
    deploymentId: `${chainName}-${chainId}-${Date.now()}`,
    chainId,
    networkName: chainName,
    deployScript,
    exportedAt: new Date().toISOString(),
  };

  writeFile(
    path.join(outputDir, "nft-collection.ts"),
    generateNftCollectionFile({
      artifact,
      deployment,
      deploymentMeta,
    }),
  );

  writeFile(
    path.join(outputDir, "nft-collection.meta.json"),
    JSON.stringify(
      generateMetaJson({
        deployment,
        deploymentMeta,
      }),
      null,
      2,
    ),
  );

  upsertIndexFile();

  console.log(`Synced ${contractConfig.name}: ${deployment.address}`);
  console.log("NFT collection contract synced.");
}

main();
