import type { SigningPayload } from "./types";

export type MockSignature = `0x${string}`;

async function sha256Hex(value: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(hashBuffer))
    .map((item) => item.toString(16).padStart(2, "0"))
    .join("");
}

export async function mockSignPayload(params: {
  account: `0x${string}`;
  payload: SigningPayload;
}): Promise<MockSignature> {
  const raw = JSON.stringify({
    signer: params.account.toLowerCase(),
    payload: params.payload,
  });

  const hash = await sha256Hex(raw);

  return `0xmock${hash}` as MockSignature;
}

export async function mockVerifySignature(params: {
  account: `0x${string}`;
  payload: SigningPayload;
  signature: string;
}) {
  const expectedSignature = await mockSignPayload({
    account: params.account,
    payload: params.payload,
  });

  return {
    valid: expectedSignature === params.signature,
    expectedSignature,
    receivedSignature: params.signature,
    recoveredSigner: params.account,
  };
}
