/**
 * wallet.ts
 * Wallet utilities for Aptos integration.
 * Uses @aptos-labs/wallet-adapter-react under the hood.
 */

// ─── Address formatting ───────────────────────────────────────────────────────

export function truncateAddress(address: string, chars = 6): string {
  if (!address) return '';
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function isValidAptosAddress(address: string): boolean {
  return /^0x[0-9a-fA-F]{1,64}$/.test(address);
}

export function normalizeAddress(address: string): string {
  if (!address.startsWith('0x')) return `0x${address}`;
  return address;
}

// ─── Known wallet adapters ────────────────────────────────────────────────────

export const KNOWN_WALLETS = [
  {
    name: 'Petra',
    icon: 'https://raw.githubusercontent.com/aptos-labs/aptos-core/main/ecosystem/web-wallet/public/logo.png',
    url: 'https://petra.app',
    description: 'Official Aptos wallet by Aptos Labs',
  },
  {
    name: 'Martian',
    icon: 'https://martianwallet.xyz/assets/martian-icon.png',
    url: 'https://martianwallet.xyz',
    description: 'Feature-rich Aptos wallet',
  },
  {
    name: 'Pontem',
    icon: 'https://pontem.network/favicon.ico',
    url: 'https://pontem.network/pontem-wallet',
    description: 'Multi-chain wallet with DeFi tools',
  },
  {
    name: 'Rise',
    icon: 'https://risewallet.io/favicon.ico',
    url: 'https://risewallet.io',
    description: 'Fast and secure Aptos wallet',
  },
] as const;

// ─── Transaction helpers ──────────────────────────────────────────────────────

/**
 * Build the explorer URL for a transaction digest.
 */
export function buildTxUrl(txDigest: string, network = 'mainnet'): string {
  const base =
    network === 'testnet'
      ? 'https://explorer.aptoslabs.com/txn'
      : 'https://explorer.aptoslabs.com/txn';
  return `${base}/${txDigest}?network=${network}`;
}

export function buildAddressUrl(address: string, network = 'mainnet'): string {
  return `https://explorer.aptoslabs.com/account/${address}?network=${network}`;
}

// ─── Sign helper (used by ShelbySDKClient) ────────────────────────────────────

/**
 * Wraps the wallet adapter's signTransaction into a simple bytes-in/bytes-out function.
 * The real adapter signs an AptosTransaction — this adapter bridge converts between
 * the Shelby SDK bytes format and the Aptos wallet adapter API.
 */
export function makeSignAdapter(
  signTransaction: (txBytes: Uint8Array) => Promise<{ signature: Uint8Array }>
): (txBytes: Uint8Array) => Promise<Uint8Array> {
  return async (txBytes: Uint8Array) => {
    const { signature } = await signTransaction(txBytes);
    return signature;
  };
}
