// Simplified in-memory storage for public keys
// In production, use IndexedDB as in the reference implementation

type FhevmStoredPublicKey = {
  publicKeyId: string;
  publicKey: Uint8Array;
};

type FhevmStoredPublicParams = {
  publicParamsId: string;
  publicParams: Uint8Array;
};

type FhevmInstanceConfigPublicKey = {
  data: Uint8Array | null;
  id: string | null;
};

type FhevmInstanceConfigPublicParams = {
  "2048": {
    publicParamsId: string;
    publicParams: Uint8Array;
  };
};

const storage = new Map<string, { publicKey?: FhevmStoredPublicKey; publicParams?: FhevmStoredPublicParams }>();

export async function publicKeyStorageGet(aclAddress: `0x${string}`): Promise<{
  publicKey?: FhevmInstanceConfigPublicKey;
  publicParams: FhevmInstanceConfigPublicParams | null;
}> {
  const stored = storage.get(aclAddress);
  if (!stored) {
    return { publicParams: null };
  }

  const publicKey = stored.publicKey
    ? {
        id: stored.publicKey.publicKeyId,
        data: stored.publicKey.publicKey,
      }
    : undefined;

  const publicParams = stored.publicParams
    ? {
        "2048": stored.publicParams,
      }
    : null;

  return {
    ...(publicKey !== undefined && { publicKey }),
    publicParams,
  };
}

export async function publicKeyStorageSet(
  aclAddress: `0x${string}`,
  publicKey: FhevmStoredPublicKey | null,
  publicParams: FhevmStoredPublicParams | null
) {
  const existing = storage.get(aclAddress) || {};
  if (publicKey) {
    existing.publicKey = publicKey;
  }
  if (publicParams) {
    existing.publicParams = publicParams;
  }
  storage.set(aclAddress, existing);
}

