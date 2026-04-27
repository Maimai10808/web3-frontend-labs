import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();

const foundryDir = path.join(rootDir, "contracts/foundry");
const contractsPackageDir = path.join(rootDir, "packages/contracts/src");

const chainName = "local";
const chainId = 31337;

// 统一部署脚本。后面建议你所有本地部署都走这个脚本。
const deployScript = "DeployLocal.s.sol";

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

function toConstName(contractName) {
  return `${contractName}Abi`;
}

function findArtifactByContractName(contractName) {
  const outDir = path.join(foundryDir, "out");

  if (!fs.existsSync(outDir)) {
    throw new Error(`Foundry out directory not found: ${outDir}`);
  }

  const stack = [outDir];

  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);

      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }

      if (entry.isFile() && entry.name === `${contractName}.json`) {
        const artifact = readJson(fullPath);

        if (artifact.contractName === contractName || artifact.abi) {
          return {
            path: fullPath,
            artifact,
          };
        }
      }
    }
  }

  throw new Error(`Artifact not found for contract: ${contractName}`);
}

function getDeployedContractsFromBroadcast(broadcastJson) {
  const transactions = broadcastJson.transactions ?? [];

  return transactions
    .filter((tx) => tx.contractName && tx.contractAddress)
    .map((tx) => ({
      name: tx.contractName,
      address: tx.contractAddress,
      transactionHash: tx.hash,
    }));
}

function generateAbiFile(contractName, abi) {
  const constName = toConstName(contractName);

  return `export const ${constName} = ${JSON.stringify(abi, null, 2)} as const;
`;
}

function generateDeploymentFile(deployments) {
  return `export const ${chainName}Deployments = {
  chainId: ${chainId},
  contracts: ${JSON.stringify(deployments, null, 2)}
} as const;
`;
}

function generateAddressesFile(deployments) {
  const lines = [];

  lines.push("export const contractAddresses = {");

  for (const [contractName, deployment] of Object.entries(deployments)) {
    lines.push(`  ${contractName}: "${deployment.address}",`);
  }

  lines.push("} as const;");
  lines.push("");

  return lines.join("\n");
}

function generateIndexFile(contractNames) {
  const lines = [];

  for (const contractName of contractNames) {
    lines.push(`export * from "./abis/${contractName}";`);
  }

  lines.push(`export * from "./deployments/${chainName}";`);
  lines.push(`export * from "./addresses";`);
  lines.push("");

  return lines.join("\n");
}

function main() {
  if (!fs.existsSync(broadcastPath)) {
    throw new Error(`Broadcast file not found: ${broadcastPath}`);
  }

  const broadcastJson = readJson(broadcastPath);
  const deployedContracts = getDeployedContractsFromBroadcast(broadcastJson);

  if (deployedContracts.length === 0) {
    throw new Error("No deployed contracts found in broadcast file.");
  }

  const deployments = {};
  const contractNames = [];

  for (const deployedContract of deployedContracts) {
    const { name, address, transactionHash } = deployedContract;

    const { artifact } = findArtifactByContractName(name);

    deployments[name] = {
      address,
      transactionHash,
    };

    contractNames.push(name);

    writeFile(
      path.join(contractsPackageDir, "abis", `${name}.ts`),
      generateAbiFile(name, artifact.abi),
    );

    console.log(`Synced ${name}: ${address}`);
  }

  writeFile(
    path.join(contractsPackageDir, "deployments", `${chainName}.ts`),
    generateDeploymentFile(deployments),
  );

  writeFile(
    path.join(contractsPackageDir, "addresses.ts"),
    generateAddressesFile(deployments),
  );

  writeFile(
    path.join(contractsPackageDir, "index.ts"),
    generateIndexFile(contractNames),
  );

  console.log("Contracts package synced.");
}

main();
