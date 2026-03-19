'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, X, CheckCircle2, AlertCircle, Loader2,
  FileText, Image, Film, Package, ExternalLink, Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useUploadBlobs } from '@/hooks';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { formatBytes, getMimeIcon, isPreviewable, truncateBlobId } from '@/lib/shelbyClient';
import { MAX_FILE_SIZE_BYTES } from '@/lib/shelbyClient';
import type { UploadTask } from '@/types';

interface FileUploadProps {
  onUploadComplete?: (blobIds: string[]) => void;
  maxFiles?: number;
  allowedTypes?: string[];
  compact?: boolean;
}

// ─── Stage label map ──────────────────────────────────────────────────────────
const STAGE_LABELS: Record<string, string> = {
  pending:     'Queued',
  encoding:    'Encoding…',
  registering: 'Registering on-chain…',
  uploading:   'Uploading to Shelby…',
  certified:   'Certified',
  failed:      'Failed',
};

// ─── Task Card ────────────────────────────────────────────────────────────────
function TaskCard({ task, onClear }: { task: UploadTask; onClear: () => void }) {
  const isDone = task.status === 'certified';
  const isFailed = task.status === 'failed';
  const isActive = !isDone && !isFailed;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      className="flex items-start gap-3 p-3 rounded-xl bg-void-100/50 border border-white/5"
    >
      {/* Icon */}
      <div className="mt-0.5 text-lg leading-none">{getMimeIcon(task.file.type)}</div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-void-900 truncate">{task.file.name}</p>
        <p className="text-xs text-void-600 mt-0.5">{formatBytes(task.file.size)}</p>

        {/* Progress */}
        {isActive && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-void-700">{STAGE_LABELS[task.status]}</span>
              <span className="text-xs text-shelby-400 font-mono">{task.progress}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${task.progress}%` }} />
            </div>
          </div>
        )}

        {/* Success */}
        {isDone && task.result && (
          <div className="mt-2 flex items-center gap-2">
            <CheckCircle2 size={13} className="text-shelby-400 shrink-0" />
            <span className="text-xs text-void-600 font-mono truncate">{truncateBlobId(task.result.blobId)}</span>
            <a
              href={task.result.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-xs text-shelby-400 hover:text-shelby-300 flex items-center gap-1"
            >
              View <ExternalLink size={10} />
            </a>
          </div>
        )}

        {/* Error */}
        {isFailed && (
          <div className="mt-2 flex items-center gap-2">
            <AlertCircle size={13} className="text-red-400 shrink-0" />
            <span className="text-xs text-red-400 truncate">{task.error ?? 'Upload failed'}</span>
          </div>
        )}
      </div>

      {/* Status indicator / remove */}
      <div className="shrink-0 mt-0.5">
        {isActive ? (
          <Loader2 size={16} className="animate-spin text-shelby-400" />
        ) : (
          <button
            onClick={onClear}
            className="p-1 rounded hover:bg-white/10 text-void-600 hover:text-void-800 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function FileUpload({
  onUploadComplete,
  maxFiles = 10,
  allowedTypes,
  compact = false,
}: FileUploadProps) {
  const { connected, account, signAndSubmitTransaction } = useWallet();
  const uploadBlobs = useUploadBlobs({
    onSuccess: (data: any) => {
      toast.success(`${data.length} file(s) uploaded successfully!`);
      if (onUploadComplete && data.length > 0) {
        onUploadComplete(data.map((b: any) => b.blobId));
      }
    },
    onError: (err: any) => {
      toast.error(`Upload failed: ${err.message}`);
    }
  });

  const { tasks, clearTask, clearCompleted, isUploading } = uploadBlobs;
  const [epochs, setEpochs] = useState(1);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!connected || !account || !signAndSubmitTransaction) {
        toast.error('Connect your wallet to upload files.');
        return;
      }

      const oversized = acceptedFiles.filter((f) => f.size > MAX_FILE_SIZE_BYTES);
      if (oversized.length > 0) {
        toast.error(`${oversized.length} file(s) exceed the 100 MB limit.`);
      }

      const valid = acceptedFiles.filter((f) => f.size <= MAX_FILE_SIZE_BYTES);
      if (valid.length === 0) return;

      const blobs = await Promise.all(valid.map(async (f) => ({
        blobName: f.name,
        blobData: new Uint8Array(await f.arrayBuffer())
      })));

      uploadBlobs.mutate({
        signer: { account: account.address, signAndSubmitTransaction },
        blobs,
        expirationMicros: Date.now() * 1000 + (epochs * 86400 * 1000 * 1000)
      });
    },
    [connected, account, signAndSubmitTransaction, uploadBlobs, epochs]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    accept: allowedTypes
      ? Object.fromEntries(allowedTypes.map((t) => [t, []]))
      : undefined,
    disabled: isUploading,
  });

  const activeTasks = tasks.filter((t) => t.status !== 'certified' && t.status !== 'failed');
  const doneTasks = tasks.filter((t) => t.status === 'certified' || t.status === 'failed');

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`
          relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer
          ${isDragActive
            ? 'dropzone-active'
            : 'border-void-300 hover:border-void-400 hover:bg-void-100/30'
          }
          ${compact ? 'p-6' : 'p-10'}
          ${isUploading ? 'pointer-events-none opacity-60' : ''}
        `}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-3 text-center">
          <div className={`relative ${compact ? 'p-3' : 'p-5'} rounded-2xl ${isDragActive ? 'bg-shelby-500/20' : 'bg-void-200'} transition-colors`}>
            <Upload
              size={compact ? 20 : 28}
              className={isDragActive ? 'text-shelby-400' : 'text-void-600'}
            />
            {isDragActive && (
              <motion.div
                className="absolute inset-0 rounded-2xl bg-shelby-400/20"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
            )}
          </div>

          {!compact && (
            <>
              <div>
                <p className="font-display font-semibold text-void-900">
                  {isDragActive ? 'Drop files here' : 'Drag & drop files'}
                </p>
                <p className="text-sm text-void-600 mt-1">
                  or <span className="text-shelby-400">browse</span> to upload
                </p>
              </div>
              <p className="text-xs text-void-500">
                Images, video, PDF, text — up to 100 MB per file
              </p>
            </>
          )}

          {compact && (
            <p className="text-sm text-void-600">
              {isDragActive ? 'Drop!' : 'Drop or click'}
            </p>
          )}
        </div>
      </div>

      {/* Storage epoch selector */}
      {!compact && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-void-100/50 border border-white/5">
          <span className="text-sm text-void-700 font-medium">Storage duration:</span>
          <div className="flex gap-1.5">
            {[1, 7, 30, 365].map((e) => (
              <button
                key={e}
                onClick={() => setEpochs(e)}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                  epochs === e
                    ? 'bg-shelby-600 text-white'
                    : 'bg-void-200 text-void-700 hover:bg-void-300'
                }`}
              >
                {e === 1 ? '1 day' : e === 7 ? '7 days' : e === 30 ? '30 days' : '1 year'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Task queue */}
      {tasks.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-void-600 uppercase tracking-wider">
              {isUploading ? 'Uploading…' : `${tasks.length} file(s)`}
            </span>
            {doneTasks.length > 0 && (
              <button
                onClick={clearCompleted}
                className="text-xs text-void-600 hover:text-void-800 flex items-center gap-1"
              >
                <Trash2 size={11} /> Clear done
              </button>
            )}
          </div>

          <AnimatePresence mode="popLayout">
            {tasks.map((task) => (
              <TaskCard
                key={task.taskId}
                task={task}
                onClear={() => clearTask(task.taskId)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Not connected hint */}
      {!connected && (
        <p className="text-xs text-center text-void-600">
          <span className="text-shelby-400">Connect your wallet</span> to start uploading files to Shelby.
        </p>
      )}
    </div>
  );
}
