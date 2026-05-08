import { randomBytes } from "crypto";

type NonceRecord = {
  address: `0x${string}`;
  nonce: `0x${string}`;
  expiresAt: number;
  used: boolean;
};

const NONCE_TTL_MS = 10 * 60 * 1000;

const globalForSignedOrderNonce = globalThis as unknown as {
  signedOrderNonceStore?: Map<string, NonceRecord>;
};

const store =
  globalForSignedOrderNonce.signedOrderNonceStore ??
  new Map<string, NonceRecord>();

globalForSignedOrderNonce.signedOrderNonceStore = store;

function normalizeAddress(address: string) {
  return address.toLowerCase() as `0x${string}`;
}

export function createSignedOrderNonce(address: `0x${string}`) {
  const normalizedAddress = normalizeAddress(address);
  const nonce = `0x${randomBytes(32).toString("hex")}` as `0x${string}`;

  const record: NonceRecord = {
    address: normalizedAddress,
    nonce,
    expiresAt: Date.now() + NONCE_TTL_MS,
    used: false,
  };

  store.set(nonce, record);

  return {
    nonce,
    expiresAt: record.expiresAt,
  };
}

export function consumeSignedOrderNonce(params: {
  address: `0x${string}`;
  nonce: `0x${string}`;
}) {
  const normalizedAddress = normalizeAddress(params.address);
  const record = store.get(params.nonce);

  if (!record) {
    return {
      ok: false as const,
      error: "NONCE_NOT_FOUND",
      message: "Nonce does not exist or has already been consumed.",
    };
  }

  if (record.used) {
    return {
      ok: false as const,
      error: "NONCE_ALREADY_USED",
      message: "Nonce has already been used.",
    };
  }

  if (record.expiresAt < Date.now()) {
    store.delete(params.nonce);

    return {
      ok: false as const,
      error: "NONCE_EXPIRED",
      message: "Nonce has expired.",
    };
  }

  if (record.address !== normalizedAddress) {
    return {
      ok: false as const,
      error: "NONCE_ADDRESS_MISMATCH",
      message: "Nonce was issued for a different address.",
    };
  }

  record.used = true;
  store.delete(params.nonce);

  return {
    ok: true as const,
  };
}
