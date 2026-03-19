// ─── Wallet ───────────────────────────────────────────────────────────────────

export interface WalletState {
  connected: boolean;
  address: string | null;
  publicKey: string | null;
  walletName: string | null;
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export interface SocialLink {
  id: string;
  title: string;
  url: string;
  icon?: string;
  clicks: number;
  order: number;
  active: boolean;
  createdAt: string;
}

export interface UserProfile {
  username: string;
  walletAddress: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  avatarBlobId?: string;
  links: SocialLink[];
  createdAt: string;
  updatedAt: string;
  theme: ProfileTheme;
  verified: boolean;
  totalViews: number;
}

export interface ProfileTheme {
  primaryColor: string;
  backgroundStyle: 'dark' | 'gradient' | 'mesh';
  cardStyle: 'glass' | 'solid' | 'outline';
}

// ─── Shelby / File Storage ────────────────────────────────────────────────────

export type BlobStatus =
  | 'pending'
  | 'encoding'
  | 'registering'
  | 'uploading'
  | 'certified'
  | 'expired'
  | 'failed';

export interface BlobMetadata {
  id: string;
  blobId: string;
  filename: string;
  mimeType: string;
  size: number;                // bytes
  uploadedAt: string;
  expiresAt: string | null;
  status: BlobStatus;
  owner: string;               // wallet address
  downloadUrl: string;
  thumbnailUrl?: string;
  isPublic: boolean;
  tags: string[];
  txDigest?: string;           // on-chain tx
}

export interface UploadTask {
  taskId: string;
  file: File;
  status: BlobStatus;
  progress: number;            // 0–100
  error?: string;
  result?: BlobMetadata;
}

export type UploadStage =
  | 'idle'
  | 'encoding'
  | 'registering'
  | 'uploading'
  | 'done'
  | 'error';

// ─── Shelby SDK (typed stubs for SDK hooks) ───────────────────────────────────

export interface ShelbyClientConfig {
  network: 'shelbynet' | 'mainnet' | 'testnet';
  rpcUrl?: string;
  aggregatorUrl?: string;
}

export interface ShelbyUploadOptions {
  file: File | Blob;
  epochs?: number;              // storage epochs (default 1 = ~1 day)
  deletable?: boolean;
  isPublic?: boolean;
  tags?: string[];
  onProgress?: (stage: UploadStage, progress: number) => void;
}

export interface ShelbyUploadResult {
  blobId: string;
  txDigest: string;
  downloadUrl: string;
  size: number;
  expiresAt: string;
  alreadyCertified: boolean;
}

export interface ShelbyBlobInfo {
  blobId: string;
  size: number;
  status: BlobStatus;
  createdAt: string;
  expiresAt: string | null;
  downloadUrl: string;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export type DashboardTab = 'overview' | 'links' | 'files' | 'upload' | 'settings';

export interface DashboardStats {
  totalFiles: number;
  totalStorageBytes: number;
  totalLinks: number;
  totalLinkClicks: number;
  profileViews: number;
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  ok: boolean;
}

// ─── UI ───────────────────────────────────────────────────────────────────────

export interface ToastOptions {
  type: 'success' | 'error' | 'info' | 'loading';
  title: string;
  description?: string;
}

export interface ModalState {
  open: boolean;
  type: 'add-link' | 'edit-link' | 'delete-link' | 'upload' | 'share' | 'qr' | null;
  payload?: unknown;
}
