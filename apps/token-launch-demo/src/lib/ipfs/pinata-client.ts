import "server-only";

import { PinataSDK } from "pinata-web3";

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const pinataJwt = getRequiredEnv("PINATA_JWT");
const pinataGateway = getRequiredEnv("PINATA_GATEWAY");

export const pinata = new PinataSDK({
  pinataJwt,
  pinataGateway,
});

export type PinataFileUploadResult = {
  ipfsHash: string;
  gatewayUrl: string;
};

export type PinataJsonUploadResult = {
  ipfsHash: string;
  gatewayUrl: string;
};

export async function uploadFileToPinata(
  file: File,
): Promise<PinataFileUploadResult> {
  const uploaded = await pinata.upload.file(file);
  const gatewayUrl = await pinata.gateways.convert(uploaded.IpfsHash);

  return {
    ipfsHash: uploaded.IpfsHash,
    gatewayUrl,
  };
}

export async function uploadJsonToPinata(
  payload: Record<string, unknown>,
): Promise<PinataJsonUploadResult> {
  const uploaded = await pinata.upload.json(payload);
  const gatewayUrl = await pinata.gateways.convert(uploaded.IpfsHash);

  return {
    ipfsHash: uploaded.IpfsHash,
    gatewayUrl,
  };
}
