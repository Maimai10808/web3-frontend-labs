const DEFAULT_IPFS_GATEWAY = "https://ipfs.io/ipfs";

function getGatewayBaseUrl() {
  const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY;

  if (!gateway) {
    return DEFAULT_IPFS_GATEWAY;
  }

  const normalized = gateway.replace(/\/$/, "");
  return normalized.endsWith("/ipfs") ? normalized : `${normalized}/ipfs`;
}

export function resolveIpfsUri(uri?: string | null): string | null {
  if (!uri) {
    return null;
  }

  if (uri.startsWith("http://") || uri.startsWith("https://")) {
    return uri;
  }

  if (!uri.startsWith("ipfs://")) {
    return uri;
  }

  const path = uri.slice("ipfs://".length).replace(/^\/+/, "");
  return `${getGatewayBaseUrl()}/${path}`;
}
