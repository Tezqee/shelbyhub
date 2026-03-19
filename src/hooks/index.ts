/**
 * hooks/index.ts
 * Custom hooks for ShelbyHub.
 * These hooks compose the Shelby SDK, Aptos wallet adapter, and React Query.
 */

'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useWallet as useAptosWallet } from '@aptos-labs/wallet-adapter-react';
import toast from 'react-hot-toast';
import { nanoid } from 'nanoid';

import { getShelbyClient } from '@/lib/shelbyClient';
import { useProfileStore } from '@/lib/store';
import type {
  BlobMetadata,
  ShelbyUploadOptions,
  UploadStage,
  UploadTask,
} from '@/types';

// ─── useWalletConnection ──────────────────────────────────────────────────────

export function useWalletConnection() {
  const adapter = useAptosWallet();
  const initProfileFromWallet = useProfileStore((s) => s.initProfileFromWallet);
  const clearProfile = useProfileStore((s) => s.clearProfile);

  const connect = useCallback(
    async (walletName: string) => {
      try {
        await adapter.connect(walletName as any);
        const address = adapter.account?.address?.toString();
        if (address) initProfileFromWallet(address);
        toast.success('Wallet connected!');
      } catch (err: any) {
        if (err?.message?.includes('User rejected')) {
          toast.error('Connection rejected.');
        } else if (err?.message?.includes('not installed')) {
          toast.error(`${walletName} is not installed.`);
        } else {
          toast.error(err?.message ?? 'Failed to connect wallet.');
        }
        throw err;
      }
    },
    [adapter, initProfileFromWallet]
  );

  const disconnect = useCallback(async () => {
    await adapter.disconnect();
    clearProfile();
    toast('Wallet disconnected.', { icon: '👋' });
  }, [adapter, clearProfile]);

  return {
    ...adapter,
    address: adapter.account?.address?.toString() ?? null,
    isConnected: adapter.connected,
    connect,
    disconnect,
  };
}

// ─── useUploadBlobs ───────────────────────────────────────────────────────────

/**
 * Hook matching the @shelby-protocol/react `useUploadBlobs` interface.
 * Manages a queue of upload tasks with per-task progress tracking.
 */
export interface UseUploadBlobsVariables {
  signer: { account: string; signAndSubmitTransaction: any } | any;
  blobs: { blobName: string; blobData: Uint8Array }[];
  expirationMicros: number;
}

export function useUploadBlobs(options?: any) {
  const [tasks, setTasks] = useState<UploadTask[]>([]);
  const addBlob = useProfileStore((s) => s.addBlob);
  const queryClient = useQueryClient();

  const updateTask = useCallback((taskId: string, patch: Partial<UploadTask>) => {
    setTasks((prev) =>
      prev.map((t) => (t.taskId === taskId ? { ...t, ...patch } : t))
    );
  }, []);

  const mutation = useMutation({
    mutationFn: async (variables: UseUploadBlobsVariables) => {
      const { signer, blobs, expirationMicros } = variables;
      const client = getShelbyClient();

      const results: BlobMetadata[] = [];
      for (const b of blobs) {
        const taskId = nanoid();
        // Reconstruct File from the Uint8Array for our internal mock structure
        let file: File;
        try {
          file = new File([new Uint8Array(b.blobData)], b.blobName, { type: 'application/octet-stream' });
        } catch {
          // Fallback if File constructor isn't available (some environments)
          file = new Blob([new Uint8Array(b.blobData)], { type: 'application/octet-stream' }) as File;
          Object.defineProperty(file, 'name', { value: b.blobName });
        }

        const task: UploadTask = { taskId, file, status: 'pending', progress: 0 };
        setTasks((prev) => [...prev, task]);

        try {
          // Mock encoding
          updateTask(taskId, { status: 'encoding', progress: 30 });
          await new Promise((res) => setTimeout(res, 800));

          // Mock registration
          updateTask(taskId, { status: 'registering', progress: 50 });
          const payload = {
            data: {
              function: `${process.env.NEXT_PUBLIC_MODULE_ADDRESS || '0x1'}::storage::upload_blob`,
              typeArguments: [],
              functionArguments: [b.blobName, expirationMicros.toString()],
            }
          };

          let txDigest = "mock_digest_" + Date.now();
          try {
            // Request wallet signature (mock smart contract call)
            const response = await signer.signAndSubmitTransaction(payload);
            txDigest = response.hash || txDigest;
          } catch (walletErr: any) {
            throw new Error(walletErr.message || 'Transaction rejected by wallet');
          }

          // Mock uploading
          updateTask(taskId, { status: 'uploading', progress: 80 });
          await new Promise((res) => setTimeout(res, 1200));

          const blobMeta: BlobMetadata = {
            id: nanoid(),
            blobId: "blob_" + nanoid(8),
            filename: b.blobName,
            mimeType: 'application/octet-stream',
            size: b.blobData.byteLength,
            uploadedAt: new Date().toISOString(),
            expiresAt: new Date(expirationMicros / 1000).toISOString(),
            status: 'certified',
            owner: signer.account?.address?.toString() || signer.account,
            downloadUrl: `https://gateway.shelby.network/v1/blobs/mock`,
            isPublic: true,
            tags: [],
            txDigest,
          };

          addBlob(blobMeta);
          updateTask(taskId, { status: 'certified', progress: 100, result: blobMeta });
          results.push(blobMeta);
        } catch (err: any) {
          updateTask(taskId, { status: 'failed', error: err.message });
          throw err;
        }
      }
      return results;
    },
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({ queryKey: ['account-blobs'] });
      options?.onSuccess?.(data, variables, context);
    },
    onError: (err: any, variables: any, context: any) => {
      options?.onError?.(err, variables, context);
    },
  });

  const clearTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.taskId !== taskId));
  }, []);

  const clearCompleted = useCallback(() => {
    setTasks((prev) => prev.filter((t) => t.status !== 'certified' && t.status !== 'failed'));
  }, []);

  return {
    ...mutation,
    tasks,
    clearTask,
    clearCompleted,
    isUploading: tasks.some((t) => !['certified', 'failed', 'pending'].includes(t.status)),
  };
}

// ─── useAccountBlobs ──────────────────────────────────────────────────────────

/**
 * Fetches blobs owned by the current wallet from the Shelby aggregator.
 * Merges with locally tracked blobs from the profile store.
 */
export function useAccountBlobs() {
  const { address } = useWalletConnection();
  const localBlobs = useProfileStore((s) => s.blobs);

  return useQuery({
    queryKey: ['account-blobs', address],
    queryFn: async () => {
      if (!address) return localBlobs;
      try {
        const client = getShelbyClient();
        const remote = await client.listAccountBlobs(address);
        // Merge remote with local (local has more metadata)
        const remoteIds = new Set(remote.map((b) => b.blobId));
        const localOnly = localBlobs.filter((b) => !remoteIds.has(b.blobId));
        return [...localBlobs.filter((b) => remoteIds.has(b.blobId)), ...localOnly];
      } catch {
        return localBlobs;
      }
    },
    enabled: true,
    initialData: localBlobs,
    staleTime: 30_000,
  });
}

// ─── useDashboardStats ────────────────────────────────────────────────────────

export function useDashboardStats() {
  const profile = useProfileStore((s) => s.profile);
  const blobs = useProfileStore((s) => s.blobs);

  const totalStorageBytes = blobs.reduce((sum, b) => sum + b.size, 0);
  const totalLinkClicks = (profile?.links ?? []).reduce((sum, l) => sum + l.clicks, 0);

  return {
    totalFiles: blobs.length,
    totalStorageBytes,
    totalLinks: profile?.links.length ?? 0,
    totalLinkClicks,
    profileViews: profile?.totalViews ?? 0,
  };
}
