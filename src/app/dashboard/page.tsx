'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HardDrive, Link2, MousePointerClick, Eye,
  TrendingUp, Upload as UploadIcon, Plus,
} from 'lucide-react';

import { Sidebar } from '@/components/Sidebar';
import { StatsCard } from '@/components/StatsCard';
import { LinkManager } from '@/components/LinkManager';
import { FileGrid } from '@/components/FileGrid';
import { FileUpload } from '@/components/FileUpload';
import { ProfileSettings } from '@/components/ProfileSettings';
import { WalletConnect } from '@/components/WalletConnect';

import { useDashboardStore, useProfileStore } from '@/lib/store';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useDashboardStats } from '@/hooks';
import { formatBytes } from '@/lib/shelbyClient';
import type { DashboardTab } from '@/types';

// ─── Tab panel wrapper ────────────────────────────────────────────────────────
function TabPanel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

// ─── Section header ────────────────────────────────────────────────────────────
function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="font-display font-bold text-xl text-void-950">{title}</h2>
        {description && <p className="text-sm text-void-600 mt-0.5">{description}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── Overview panel ────────────────────────────────────────────────────────────
function OverviewPanel() {
  const stats = useDashboardStats();
  const profile = useProfileStore((s) => s.profile);
  const setActiveTab = useDashboardStore((s) => s.setActiveTab);

  return (
    <TabPanel>
      <SectionHeader
        title={`Welcome back${profile?.displayName ? `, ${profile.displayName}` : ''}!`}
        description="Here's an overview of your ShelbyHub."
      />

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          label="Total Files"
          value={stats.totalFiles}
          icon={HardDrive}
          iconColor="#14b8a6"
          delay={0}
        />
        <StatsCard
          label="Storage Used"
          value={stats.totalStorageBytes}
          icon={TrendingUp}
          iconColor="#818cf8"
          format={(n) => formatBytes(n)}
          delay={0.05}
        />
        <StatsCard
          label="Links"
          value={stats.totalLinks}
          icon={Link2}
          iconColor="#fb923c"
          delay={0.1}
        />
        <StatsCard
          label="Link Clicks"
          value={stats.totalLinkClicks}
          icon={MousePointerClick}
          iconColor="#f472b6"
          delay={0.15}
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          {
            icon: UploadIcon,
            title: 'Upload File',
            desc: 'Store files on Shelby',
            tab: 'upload' as DashboardTab,
            color: '#14b8a6',
          },
          {
            icon: Plus,
            title: 'Add Link',
            desc: 'Grow your link tree',
            tab: 'links' as DashboardTab,
            color: '#fb923c',
          },
          {
            icon: Eye,
            title: 'View Profile',
            desc: 'See your public page',
            tab: null,
            href: `/u/${profile?.username}`,
            color: '#818cf8',
          },
        ].map((item) => (
          <button
            key={item.title}
            onClick={() => item.tab && setActiveTab(item.tab)}
            className="group flex items-center gap-4 p-4 rounded-2xl bg-void-100/40 border border-white/5 hover:border-white/10 hover:bg-void-100/70 transition-all text-left"
          >
            <div
              className="p-3 rounded-xl shrink-0"
              style={{ background: `${item.color}18` }}
            >
              <item.icon size={18} style={{ color: item.color }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-void-900 group-hover:text-void-950">{item.title}</p>
              <p className="text-xs text-void-500">{item.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Recent files */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-void-800">Recent Files</h3>
          <button
            onClick={() => setActiveTab('files')}
            className="text-xs text-shelby-400 hover:text-shelby-300"
          >
            View all →
          </button>
        </div>
        <FileGrid limit={6} showEmpty />
      </div>
    </TabPanel>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { connected, account } = useWallet();
  const activeTab = useDashboardStore((s) => s.activeTab);
  const initProfile = useProfileStore((s) => s.initProfileFromWallet);

  // Init profile when wallet connects
  useEffect(() => {
    const address = account?.address?.toString();
    if (connected && address) initProfile(address);
  }, [connected, account?.address]);

  return (
    <div className="flex h-screen bg-void-DEFAULT overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 h-16 border-b border-white/5 bg-void-50/40 backdrop-blur-sm shrink-0">
          <div>
            <h1 className="font-display font-semibold text-void-900 capitalize">{activeTab}</h1>
          </div>
          <WalletConnect />
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Not connected banner */}
          {!connected && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center justify-between p-4 rounded-2xl bg-shelby-500/10 border border-shelby-500/20"
            >
              <div>
                <p className="text-sm font-medium text-shelby-300">Wallet not connected</p>
                <p className="text-xs text-shelby-400/70 mt-0.5">
                  Connect your Aptos wallet to upload files and manage your profile.
                </p>
              </div>
              <WalletConnect />
            </motion.div>
          )}

          {/* Tab panels */}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <TabPanel key="overview">
                <OverviewPanel />
              </TabPanel>
            )}

            {activeTab === 'links' && (
              <TabPanel key="links">
                <SectionHeader
                  title="My Links"
                  description="Add, edit, and reorder the links on your public profile."
                />
                <div className="max-w-2xl">
                  <LinkManager />
                </div>
              </TabPanel>
            )}

            {activeTab === 'files' && (
              <TabPanel key="files">
                <SectionHeader
                  title="My Files"
                  description="All files stored on the Shelby decentralized network."
                  action={
                    <button
                      onClick={() => useDashboardStore.getState().setActiveTab('upload')}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-shelby-600 hover:bg-shelby-500 text-white text-sm font-medium transition-all"
                    >
                      <UploadIcon size={14} /> Upload
                    </button>
                  }
                />
                <FileGrid showEmpty />
              </TabPanel>
            )}

            {activeTab === 'upload' && (
              <TabPanel key="upload">
                <SectionHeader
                  title="Upload Files"
                  description="Upload files to the Shelby decentralized storage network."
                />
                <div className="max-w-2xl">
                  <FileUpload
                    onUploadComplete={(ids) => {
                      if (ids.length > 0) {
                        useDashboardStore.getState().setActiveTab('files');
                      }
                    }}
                  />
                </div>
              </TabPanel>
            )}

            {activeTab === 'settings' && (
              <TabPanel key="settings">
                <SectionHeader
                  title="Settings"
                  description="Customize your public profile."
                />
                <ProfileSettings />
              </TabPanel>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
