'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, FileText, HardDrive, ExternalLink, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { ProfileCard } from '@/components/ProfileCard';
import { useProfileStore } from '@/lib/store';
import { formatBytes, getMimeIcon } from '@/lib/shelbyClient';
import type { UserProfile, BlobMetadata } from '@/types';

// ─── Particle background ────────────────────────────────────────────────────
function GridBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(20,184,166,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(20,184,166,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />
      {/* Radial glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-3xl opacity-20"
        style={{ background: 'radial-gradient(ellipse, #14b8a640 0%, transparent 70%)' }}
      />
    </div>
  );
}

// ─── Public files section ────────────────────────────────────────────────────
function PublicFiles({ blobs, username }: { blobs: BlobMetadata[]; username: string }) {
  const publicBlobs = blobs.filter((b) => b.isPublic && b.status === 'certified');
  if (publicBlobs.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="w-full max-w-md mx-auto mt-6"
    >
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <HardDrive size={14} className="text-shelby-400" />
          <h2 className="font-display font-semibold text-sm text-void-800">
            Shared Files ({publicBlobs.length})
          </h2>
        </div>
        <div className="space-y-2">
          {publicBlobs.map((blob) => (
            <a
              key={blob.id}
              href={blob.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group"
            >
              <span className="text-lg shrink-0">{getMimeIcon(blob.mimeType)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-void-800 truncate group-hover:text-void-950">{blob.filename}</p>
                <p className="text-xs text-void-500">{formatBytes(blob.size)}</p>
              </div>
              <Download size={13} className="text-void-500 group-hover:text-shelby-400 transition-colors shrink-0" />
            </a>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Not found ────────────────────────────────────────────────────────────────
function ProfileNotFound({ username }: { username: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-void-200 flex items-center justify-center">
        <FileText size={24} className="text-void-500" />
      </div>
      <div>
        <h1 className="font-display font-bold text-2xl text-void-800">@{username}</h1>
        <p className="text-sm text-void-500 mt-1">This profile doesn't exist or hasn't been set up yet.</p>
      </div>
      <Link
        href="/"
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-shelby-600 hover:bg-shelby-500 text-white text-sm font-medium transition-colors"
      >
        Create your hub →
      </Link>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function PublicProfilePage() {
  const params = useParams();
  const username = params?.username as string;

  const storeProfile = useProfileStore((s) => s.profile);
  const storeBlobs = useProfileStore((s) => s.blobs);
  const incrementClicks = useProfileStore((s) => s.incrementLinkClicks);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [blobs, setBlobs] = useState<BlobMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production: fetch from API or on-chain registry.
    // For now: match against the locally stored profile.
    const timer = setTimeout(() => {
      if (storeProfile?.username === username) {
        setProfile(storeProfile);
        setBlobs(storeBlobs);
      }
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [username, storeProfile, storeBlobs]);

  return (
    <div className="min-h-screen bg-void-DEFAULT relative">
      <GridBackground />

      {/* Top bar */}
      <nav className="relative z-10 flex items-center justify-between px-6 h-14">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-void-600 hover:text-void-800 transition-colors"
        >
          <ArrowLeft size={13} />
          ShelbyHub
        </Link>

        <Link
          href="/dashboard"
          className="text-xs text-shelby-400 hover:text-shelby-300 flex items-center gap-1"
        >
          Create yours <ExternalLink size={11} />
        </Link>
      </nav>

      {/* Content */}
      <main className="relative z-10 px-4 pb-20 pt-6">
        {loading ? (
          <div className="flex items-center justify-center pt-20">
            <Loader2 size={24} className="animate-spin text-shelby-500" />
          </div>
        ) : !profile ? (
          <ProfileNotFound username={username} />
        ) : (
          <>
            <ProfileCard
              profile={profile}
              isOwner={false}
              onLinkClick={incrementClicks}
            />
            <PublicFiles blobs={blobs} username={username} />

            {/* Footer badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center mt-8"
            >
              <Link
                href="/"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-void-200/60 border border-white/5 text-xs text-void-500 hover:text-void-700 transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-shelby-500" />
                Built on ShelbyHub
              </Link>
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
}
