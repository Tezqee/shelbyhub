'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, QrCode, Share2, ExternalLink, Verified } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import type { UserProfile } from '@/types';
import { truncateAddress } from '@/lib/wallet';

interface ProfileCardProps {
  profile: UserProfile;
  isOwner?: boolean;
  onLinkClick?: (linkId: string) => void;
}

export function ProfileCard({ profile, isOwner = false, onLinkClick }: ProfileCardProps) {
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  const profileUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/u/${profile.username}`
      : `/u/${profile.username}`;

  const activeLinks = [...profile.links]
    .filter((l) => l.active)
    .sort((a, b) => a.order - b.order);

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Profile link copied!');
  };

  const handleLinkClick = (linkId: string, url: string) => {
    onLinkClick?.(linkId);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Avatar + bio card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 text-center space-y-3"
      >
        {/* Avatar */}
        <div className="relative inline-block">
          <div className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-shelby-500/30 ring-offset-2 ring-offset-void-DEFAULT">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.displayName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-shelby-700 to-shelby-900 flex items-center justify-center">
                <span className="text-3xl font-display font-bold text-shelby-200">
                  {profile.displayName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          {profile.verified && (
            <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-shelby-600">
              <Verified size={10} className="text-white" />
            </div>
          )}
        </div>

        {/* Name + username */}
        <div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="font-display font-bold text-xl text-void-950">{profile.displayName}</h1>
          </div>
          <p className="text-sm text-void-600 font-mono">@{profile.username}</p>
          {profile.walletAddress && (
            <p className="text-xs text-void-500 font-mono mt-1">
              {truncateAddress(profile.walletAddress)}
            </p>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-sm text-void-700 max-w-xs mx-auto">{profile.bio}</p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <button
            onClick={handleCopyUrl}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-void-200 hover:bg-void-300 text-void-700 text-xs font-medium transition-colors"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy link'}
          </button>
          <button
            onClick={() => setShowQR(!showQR)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              showQR
                ? 'bg-shelby-600 text-white'
                : 'bg-void-200 hover:bg-void-300 text-void-700'
            }`}
          >
            <QrCode size={12} />
            QR Code
          </button>
          {typeof navigator !== 'undefined' && navigator.share && (
            <button
              onClick={() =>
                navigator.share({ title: profile.displayName, url: profileUrl })
              }
              className="p-1.5 rounded-lg bg-void-200 hover:bg-void-300 text-void-700 transition-colors"
            >
              <Share2 size={14} />
            </button>
          )}
        </div>

        {/* QR Code */}
        {showQR && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3 pt-2"
          >
            <div className="p-3 rounded-xl bg-white">
              <QRCodeSVG
                value={profileUrl}
                size={140}
                bgColor="#ffffff"
                fgColor="#042f2e"
                level="M"
                includeMargin={false}
              />
            </div>
            <p className="text-xs text-void-500">Scan to visit profile</p>
          </motion.div>
        )}
      </motion.div>

      {/* Links */}
      <div className="space-y-2.5">
        {activeLinks.map((link, i) => (
          <motion.button
            key={link.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => handleLinkClick(link.id, link.url)}
            className="w-full flex items-center gap-3 p-4 rounded-2xl glass glass-hover group text-left transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-shelby-500/15 flex items-center justify-center shrink-0">
              <ExternalLink size={14} className="text-shelby-400" />
            </div>
            <span className="flex-1 font-display font-semibold text-sm text-void-900 group-hover:text-void-950">
              {link.title}
            </span>
            <ExternalLink
              size={12}
              className="text-void-500 group-hover:text-void-700 transition-colors"
            />
          </motion.button>
        ))}

        {activeLinks.length === 0 && (
          <div className="text-center py-8 text-sm text-void-500">
            No links shared yet.
          </div>
        )}
      </div>
    </div>
  );
}
