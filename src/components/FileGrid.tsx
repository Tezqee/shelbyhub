'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, ExternalLink, Trash2, Copy, Check,
  Eye, Clock, HardDrive, Tag, X, ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useAccountBlobs } from '@/hooks';
import { useProfileStore } from '@/lib/store';
import { formatBytes, getMimeIcon, isPreviewable, truncateBlobId } from '@/lib/shelbyClient';
import { buildTxUrl } from '@/lib/wallet';
import type { BlobMetadata } from '@/types';

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: BlobMetadata['status'] }) {
  const map: Record<string, { label: string; cls: string }> = {
    certified:  { label: 'Live', cls: 'bg-shelby-500/15 text-shelby-400 border-shelby-500/20' },
    uploading:  { label: 'Uploading', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
    registering:{ label: 'Registering', cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' },
    encoding:   { label: 'Encoding', cls: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
    failed:     { label: 'Failed', cls: 'bg-red-500/15 text-red-400 border-red-500/20' },
    expired:    { label: 'Expired', cls: 'bg-void-400/15 text-void-500 border-void-400/20' },
    pending:    { label: 'Pending', cls: 'bg-void-400/15 text-void-500 border-void-400/20' },
  };
  const { label, cls } = map[status] ?? map.pending;
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {label}
    </span>
  );
}

// ─── Blob Detail Modal ────────────────────────────────────────────────────────
function BlobDetailModal({ blob, onClose }: { blob: BlobMetadata; onClose: () => void }) {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const removeBlob = useProfileStore((s) => s.removeBlob);

  const copyId = async () => {
    await navigator.clipboard.writeText(blob.blobId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const copyUrl = async () => {
    await navigator.clipboard.writeText(blob.downloadUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
    toast.success('Link copied!');
  };

  const handleDelete = () => {
    removeBlob(blob.id);
    toast('File removed from your hub.', { icon: '🗑️' });
    onClose();
  };

  const expiresIn = blob.expiresAt
    ? Math.max(0, Math.floor((new Date(blob.expiresAt).getTime() - Date.now()) / 86_400_000))
    : null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-lg glass rounded-2xl overflow-hidden"
        initial={{ scale: 0.95, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 16 }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-white/5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">{getMimeIcon(blob.mimeType)}</span>
            <div>
              <h3 className="font-display font-bold text-void-950 truncate max-w-xs">{blob.filename}</h3>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={blob.status} />
                <span className="text-xs text-void-600">{formatBytes(blob.size)}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-void-600">
            <X size={18} />
          </button>
        </div>

        {/* Preview */}
        {isPreviewable(blob.mimeType) && blob.status === 'certified' && (
          <div className="border-b border-white/5 bg-void-50/20 flex items-center justify-center" style={{ height: 200 }}>
            {blob.mimeType.startsWith('image/') ? (
              <img
                src={blob.downloadUrl}
                alt={blob.filename}
                className="max-h-full max-w-full object-contain rounded"
              />
            ) : blob.mimeType.startsWith('video/') ? (
              <video src={blob.downloadUrl} controls className="max-h-full max-w-full rounded" />
            ) : null}
          </div>
        )}

        {/* Details */}
        <div className="p-5 space-y-3">
          {/* Blob ID */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-void-100/50">
            <div>
              <p className="text-xs text-void-500 mb-0.5">Blob ID</p>
              <p className="text-sm font-mono text-void-800">{truncateBlobId(blob.blobId, 12)}</p>
            </div>
            <button onClick={copyId} className="p-1.5 rounded-lg hover:bg-white/10 text-void-600">
              {copiedId ? <Check size={14} className="text-shelby-400" /> : <Copy size={14} />}
            </button>
          </div>

          {/* Download URL */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-void-100/50">
            <div className="min-w-0">
              <p className="text-xs text-void-500 mb-0.5">Download URL</p>
              <p className="text-sm font-mono text-void-800 truncate max-w-xs">{blob.downloadUrl}</p>
            </div>
            <button onClick={copyUrl} className="p-1.5 rounded-lg hover:bg-white/10 text-void-600 shrink-0 ml-2">
              {copiedUrl ? <Check size={14} className="text-shelby-400" /> : <Copy size={14} />}
            </button>
          </div>

          {/* Meta row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-void-100/50">
              <p className="text-xs text-void-500 mb-0.5 flex items-center gap-1">
                <Clock size={10} /> Uploaded
              </p>
              <p className="text-sm text-void-800">{new Date(blob.uploadedAt).toLocaleDateString()}</p>
            </div>
            <div className="p-3 rounded-xl bg-void-100/50">
              <p className="text-xs text-void-500 mb-0.5 flex items-center gap-1">
                <Clock size={10} /> Expires
              </p>
              <p className="text-sm text-void-800">
                {expiresIn !== null ? `${expiresIn}d` : 'Never'}
              </p>
            </div>
          </div>

          {blob.txDigest && (
            <a
              href={buildTxUrl(blob.txDigest)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 rounded-xl bg-void-100/50 hover:bg-void-200/50 transition-colors group"
            >
              <p className="text-xs text-void-500 flex-1">View on-chain tx</p>
              <span className="text-xs font-mono text-shelby-400 group-hover:text-shelby-300">
                {blob.txDigest.slice(0, 16)}…
              </span>
              <ExternalLink size={11} className="text-void-500" />
            </a>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex gap-3 p-5 pt-0">
          <a
            href={blob.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-shelby-600 hover:bg-shelby-500 text-white text-sm font-medium transition-colors"
          >
            <Download size={14} /> Download
          </a>
          <button
            onClick={handleDelete}
            className="px-4 py-2.5 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Trash2 size={14} /> Remove
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── File Grid ────────────────────────────────────────────────────────────────
interface FileGridProps {
  limit?: number;
  showEmpty?: boolean;
}

export function FileGrid({ limit, showEmpty = true }: FileGridProps) {
  const { data: blobs = [], isLoading } = useAccountBlobs();
  const [selectedBlob, setSelectedBlob] = useState<BlobMetadata | null>(null);
  const [filter, setFilter] = useState<'all' | 'image' | 'video' | 'document'>('all');

  const filtered = blobs.filter((b) => {
    if (filter === 'all') return true;
    if (filter === 'image') return b.mimeType.startsWith('image/');
    if (filter === 'video') return b.mimeType.startsWith('video/');
    if (filter === 'document') return b.mimeType === 'application/pdf' || b.mimeType.startsWith('text/');
    return true;
  });

  const displayed = limit ? filtered.slice(0, limit) : filtered;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl skeleton" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      {blobs.length > 0 && !limit && (
        <div className="flex gap-1.5">
          {(['all', 'image', 'video', 'document'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filter === f
                  ? 'bg-shelby-600 text-white'
                  : 'bg-void-200 text-void-600 hover:bg-void-300'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          <span className="ml-auto text-xs text-void-500 self-center">{filtered.length} files</span>
        </div>
      )}

      {/* Grid */}
      {displayed.length === 0 && showEmpty ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="p-4 rounded-2xl bg-void-100/50">
            <HardDrive size={24} className="text-void-500" />
          </div>
          <div>
            <p className="font-medium text-void-700">No files yet</p>
            <p className="text-sm text-void-500 mt-1">Upload your first file to Shelby</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <AnimatePresence>
            {displayed.map((blob, i) => (
              <motion.button
                key={blob.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setSelectedBlob(blob)}
                className="group relative p-3 rounded-xl bg-void-100/40 border border-white/5 hover:border-white/10 hover:bg-void-100/70 transition-all text-left"
              >
                {/* Preview thumbnail */}
                <div className="w-full aspect-video rounded-lg bg-void-200 mb-2 overflow-hidden flex items-center justify-center">
                  {blob.mimeType.startsWith('image/') && blob.status === 'certified' ? (
                    <img
                      src={blob.downloadUrl}
                      alt={blob.filename}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-2xl">{getMimeIcon(blob.mimeType)}</span>
                  )}
                </div>

                {/* Info */}
                <p className="text-xs font-medium text-void-800 truncate">{blob.filename}</p>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-xs text-void-500">{formatBytes(blob.size)}</p>
                  <StatusBadge status={blob.status} />
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 rounded-xl bg-void-DEFAULT/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Eye size={18} className="text-void-900" />
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Blob detail modal */}
      <AnimatePresence>
        {selectedBlob && (
          <BlobDetailModal blob={selectedBlob} onClose={() => setSelectedBlob(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
