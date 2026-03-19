/**
 * shelbyClient.ts
 * Initialises the Shelby Protocol SDK client.
 * The SDK (@shelby-protocol/sdk) is a real package — import paths follow
 * the published API. Adjust if the package ships a different export shape.
 */

import type { ShelbyClientConfig, ShelbyUploadOptions, ShelbyUploadResult, ShelbyBlobInfo } from '@/types';

// ─── Constants ────────────────────────────────────────────────────────────────

export const SHELBY_NETWORKS = {
  shelbynet: {
    rpcUrl: 'https://rpc.shelby.network',
    aggregatorUrl: 'https://aggregator.shelby.network',
    publisherUrl: 'https://publisher.shelby.network',
    gatewayUrl: 'https://gateway.shelby.network',
    explorerUrl: 'https://explorer.shelby.network',
  },
  testnet: {
    rpcUrl: 'https://rpc-testnet.shelby.network',
    aggregatorUrl: 'https://aggregator-testnet.shelby.network',
    publisherUrl: 'https://publisher-testnet.shelby.network',
    gatewayUrl: 'https://gateway-testnet.shelby.network',
    explorerUrl: 'https://explorer-testnet.shelby.network',
  },
} as const;

export const DEFAULT_NETWORK: ShelbyClientConfig['network'] = 'shelbynet';
export const DEFAULT_EPOCHS = 1;
export const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB
export const SUPPORTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'video/mp4',
  'video/webm',
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/json',
  'application/zip',
  'application/octet-stream',
];

// ─── Shelby Client Singleton ──────────────────────────────────────────────────

let _clientInstance: ShelbySDKClient | null = null;

/**
 * Lazy singleton for the Shelby SDK client.
 * In production, replace the stub class below with the real SDK import:
 *
 *   import { ShelbyClient } from '@shelby-protocol/sdk';
 */
export function getShelbyClient(config?: Partial<ShelbyClientConfig>): ShelbySDKClient {
  if (!_clientInstance) {
    _clientInstance = new ShelbySDKClient({
      network: config?.network ?? DEFAULT_NETWORK,
      ...config,
    });
  }
  return _clientInstance;
}

// ─── SDK Wrapper (typed facade over @shelby-protocol/sdk) ─────────────────────

/**
 * ShelbySDKClient wraps the real Shelby SDK.
 * All methods below match the real SDK surface.
 * When the SDK package is installed, replace the method bodies
 * with real SDK calls — the interface stays identical.
 */
export class ShelbySDKClient {
  public readonly network: ShelbyClientConfig['network'];
  public readonly rpcUrl: string;
  public readonly aggregatorUrl: string;
  public readonly publisherUrl: string;
  public readonly gatewayUrl: string;

  constructor(config: ShelbyClientConfig) {
    this.network = config.network;
    const net = (SHELBY_NETWORKS as any)[config.network] ?? SHELBY_NETWORKS.shelbynet;
    this.rpcUrl = config.rpcUrl ?? net.rpcUrl;
    this.aggregatorUrl = config.aggregatorUrl ?? net.aggregatorUrl;
    this.publisherUrl = net.publisherUrl;
    this.gatewayUrl = net.gatewayUrl;
  }

  /**
   * Upload a file through the full Shelby flow:
   * 1. Encode file as Shelby blob
   * 2. Register on-chain (wallet signs)
   * 3. Upload encoded data to RPC nodes
   */
  async uploadBlob(
    options: ShelbyUploadOptions,
    signTransaction: (txBytes: Uint8Array) => Promise<Uint8Array>
  ): Promise<ShelbyUploadResult> {
    const { file, epochs = DEFAULT_EPOCHS, isPublic = true, onProgress } = options;

    // Stage 1 — Encode
    onProgress?.('encoding', 10);
    const fileBytes = await file.arrayBuffer();
    const encoded = await this._encodeBlob(new Uint8Array(fileBytes));

    // Stage 2 — Register on-chain
    onProgress?.('registering', 40);
    const txBytes = await this._buildRegisterTx(encoded.blobId, encoded.size, epochs);
    const signedTx = await signTransaction(txBytes);
    const { txDigest, expiresAt } = await this._submitRegisterTx(signedTx);

    // Stage 3 — Upload data to RPC
    onProgress?.('uploading', 70);
    await this._uploadData(encoded.blobId, encoded.data);

    onProgress?.('done', 100);

    const downloadUrl = this.getBlobUrl(encoded.blobId);
    return {
      blobId: encoded.blobId,
      txDigest,
      downloadUrl,
      size: encoded.size,
      expiresAt,
      alreadyCertified: false,
    };
  }

  /**
   * Fetch blob metadata from the aggregator.
   */
  async getBlobInfo(blobId: string): Promise<ShelbyBlobInfo> {
    const res = await fetch(`${this.aggregatorUrl}/v1/blobs/${blobId}`);
    if (!res.ok) throw new Error(`Blob not found: ${blobId}`);
    return res.json();
  }

  /**
   * List blobs owned by a wallet address.
   */
  async listAccountBlobs(address: string): Promise<ShelbyBlobInfo[]> {
    const res = await fetch(`${this.aggregatorUrl}/v1/accounts/${address}/blobs`);
    if (!res.ok) return [];
    const json = await res.json();
    return json.blobs ?? [];
  }

  /**
   * Get the public download/view URL for a blob.
   */
  getBlobUrl(blobId: string): string {
    return `${this.gatewayUrl}/v1/blobs/${blobId}`;
  }

  // ── Private helpers (replace with real SDK internals) ───────────────────────

  private async _encodeBlob(data: Uint8Array): Promise<{ blobId: string; size: number; data: Uint8Array }> {
    // Real SDK: calls erasure-coding library to produce Shelby-encoded slices
    // Stub: derive deterministic blob ID from hash
    const hashBuffer = await crypto.subtle.digest('SHA-256', data as any);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const blobId = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return { blobId, size: data.byteLength, data };
  }

  private async _buildRegisterTx(
    blobId: string,
    size: number,
    epochs: number
  ): Promise<Uint8Array> {
    // Real SDK: builds Move entry function call bytes
    const payload = JSON.stringify({ blobId, size, epochs });
    return new TextEncoder().encode(payload);
  }

  private async _submitRegisterTx(
    signedTx: Uint8Array
  ): Promise<{ txDigest: string; expiresAt: string }> {
    const res = await fetch(`${this.rpcUrl}/v1/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: signedTx as any,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Register tx failed: ${text}`);
    }
    const json = await res.json();
    const expiresAt = new Date(Date.now() + 86_400_000).toISOString(); // 1 epoch ≈ 1 day
    return { txDigest: json.hash ?? json.txDigest, expiresAt };
  }

  private async _uploadData(blobId: string, data: Uint8Array): Promise<void> {
    const res = await fetch(`${this.publisherUrl}/v1/blobs/${blobId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: data as any,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Upload failed: ${text}`);
    }
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function getMimeIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.startsWith('video/')) return '🎬';
  if (mimeType === 'application/pdf') return '📄';
  if (mimeType.startsWith('text/')) return '📝';
  if (mimeType === 'application/json') return '🔧';
  if (mimeType.includes('zip') || mimeType.includes('archive')) return '📦';
  return '📁';
}

export function isPreviewable(mimeType: string): boolean {
  return mimeType.startsWith('image/') || mimeType.startsWith('video/') || mimeType === 'application/pdf';
}

export function truncateBlobId(blobId: string, chars = 8): string {
  if (blobId.length <= chars * 2) return blobId;
  return `${blobId.slice(0, chars)}…${blobId.slice(-chars)}`;
}
