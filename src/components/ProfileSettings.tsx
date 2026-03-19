'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, User, AtSign, FileText, Image, Loader2, CheckCircle2, Palette } from 'lucide-react';
import toast from 'react-hot-toast';
import { useProfileStore } from '@/lib/store';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { WalletConnect } from './WalletConnect';

export function ProfileSettings() {
  const profile = useProfileStore((s) => s.profile);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const { connected } = useWallet();

  const [form, setForm] = useState({
    displayName: profile?.displayName ?? '',
    username: profile?.username ?? '',
    bio: profile?.bio ?? '',
    avatarUrl: profile?.avatarUrl ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sync form when profile loads
  useEffect(() => {
    if (profile) {
      setForm({
        displayName: profile.displayName,
        username: profile.username,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl ?? '',
      });
    }
  }, [profile?.walletAddress]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.displayName.trim()) {
      toast.error('Display name is required.');
      return;
    }
    if (!/^[a-z0-9_]{3,30}$/.test(form.username)) {
      toast.error('Username: 3–30 chars, lowercase letters, numbers, underscores only.');
      return;
    }

    setSaving(true);
    // Simulate async save (replace with on-chain or API call)
    await new Promise((r) => setTimeout(r, 600));
    updateProfile({
      displayName: form.displayName.trim(),
      username: form.username.trim(),
      bio: form.bio.trim(),
      avatarUrl: form.avatarUrl.trim() || null,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    toast.success('Profile saved!');
  };

  if (!connected) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="p-4 rounded-2xl bg-void-100/50">
          <User size={28} className="text-void-500" />
        </div>
        <div>
          <p className="font-display font-semibold text-void-800">Connect your wallet</p>
          <p className="text-sm text-void-500 mt-1">Connect to manage your profile settings</p>
        </div>
        <WalletConnect />
      </div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSave}
      className="space-y-6 max-w-lg"
    >
      {/* Avatar preview + URL */}
      <div className="flex items-start gap-4 p-5 rounded-2xl bg-void-100/40 border border-white/5">
        <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-shelby-500/20 shrink-0">
          {form.avatarUrl ? (
            <img
              src={form.avatarUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = ''; }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-shelby-700 to-shelby-900 flex items-center justify-center">
              <span className="text-2xl font-display font-bold text-shelby-200">
                {(form.displayName || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-void-600 mb-1.5">
            <Image size={12} className="inline mr-1" />
            Avatar URL
          </label>
          <input
            type="url"
            placeholder="https://example.com/avatar.jpg"
            value={form.avatarUrl}
            onChange={(e) => setForm((f) => ({ ...f, avatarUrl: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg bg-void-200 border border-white/5 text-sm text-void-900 placeholder-void-500 focus:outline-none focus:border-shelby-500 focus:ring-1 focus:ring-shelby-500/30 transition-all"
          />
          <p className="text-xs text-void-500 mt-1">Paste a direct image URL or upload to Shelby first</p>
        </div>
      </div>

      {/* Display Name */}
      <div>
        <label className="block text-xs font-medium text-void-600 mb-1.5">
          <User size={12} className="inline mr-1" />
          Display Name
        </label>
        <input
          type="text"
          value={form.displayName}
          onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
          placeholder="Your name"
          maxLength={50}
          className="w-full px-3 py-2.5 rounded-xl bg-void-100/60 border border-white/5 text-sm text-void-900 placeholder-void-500 focus:outline-none focus:border-shelby-500 focus:ring-1 focus:ring-shelby-500/30 transition-all"
        />
      </div>

      {/* Username */}
      <div>
        <label className="block text-xs font-medium text-void-600 mb-1.5">
          <AtSign size={12} className="inline mr-1" />
          Username
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-void-500">@</span>
          <input
            type="text"
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
            placeholder="username"
            maxLength={30}
            className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-void-100/60 border border-white/5 text-sm text-void-900 placeholder-void-500 focus:outline-none focus:border-shelby-500 focus:ring-1 focus:ring-shelby-500/30 transition-all font-mono"
          />
        </div>
        <p className="text-xs text-void-500 mt-1">
          Your public URL: <span className="text-shelby-400">/u/{form.username || 'username'}</span>
        </p>
      </div>

      {/* Bio */}
      <div>
        <label className="block text-xs font-medium text-void-600 mb-1.5">
          <FileText size={12} className="inline mr-1" />
          Bio
        </label>
        <textarea
          value={form.bio}
          onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
          placeholder="A short bio about yourself…"
          maxLength={160}
          rows={3}
          className="w-full px-3 py-2.5 rounded-xl bg-void-100/60 border border-white/5 text-sm text-void-900 placeholder-void-500 focus:outline-none focus:border-shelby-500 focus:ring-1 focus:ring-shelby-500/30 transition-all resize-none"
        />
        <p className="text-right text-xs text-void-500 mt-0.5">{form.bio.length}/160</p>
      </div>

      {/* Save */}
      <button
        type="submit"
        disabled={saving}
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-shelby-600 hover:bg-shelby-500 disabled:opacity-60 text-white text-sm font-semibold transition-all btn-glow"
      >
        {saving ? (
          <Loader2 size={15} className="animate-spin" />
        ) : saved ? (
          <CheckCircle2 size={15} />
        ) : (
          <Save size={15} />
        )}
        {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
      </button>
    </motion.form>
  );
}
