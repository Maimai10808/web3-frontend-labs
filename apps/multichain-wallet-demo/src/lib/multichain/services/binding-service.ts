import type { SignatureResult } from "../types";

type NonceResponse = {
  ok: boolean;
  nonce: string;
  issuedAt: string;
  message: string;
};

type BindResponse = {
  ok: boolean;
  binding: {
    ecosystem: string;
    address: string;
    nonce: string;
    mode: string;
    verifiedAt: string;
    verifier: string;
  };
};

export async function fetchBindingNonce() {
  const response = await fetch("/api/wallet/nonce", {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch binding nonce");
  }

  return (await response.json()) as NonceResponse;
}

export async function submitBinding(params: {
  ecosystem: string;
  nonce: string;
  signatureResult: SignatureResult;
}) {
  const response = await fetch("/api/wallet/bind", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      ecosystem: params.ecosystem,
      address: params.signatureResult.address,
      signature: params.signatureResult.signature,
      nonce: params.nonce,
      mode: params.signatureResult.kind,
    }),
  });

  if (!response.ok) {
    throw new Error("Bind wallet request failed");
  }

  return (await response.json()) as BindResponse;
}
