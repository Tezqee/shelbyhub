'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Link2, HardDrive, Upload,
  Settings, ChevronLeft, ChevronRight, ExternalLink,
  Hexagon, User,
} from 'lucide-react';

import { WalletConnect } from './WalletConnect';
import { useDashboardStore, useProfileStore } from '@/lib/store';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { truncateAddress } from '@/lib/wallet';
import { formatBytes } from '@/lib/shelbyClient';
import { useDashboardStats } from '@/hooks';
import type { DashboardTab } from '@/types';

interface NavItem {
  id: DashboardTab;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview',      icon: LayoutDashboard },
  { id: 'links',    label: 'My Links',      icon: Link2 },
  { id: 'files',    label: 'My Files',      icon: HardDrive },
  { id: 'upload',   label: 'Upload',        icon: Upload },
  { id: 'settings', label: 'Settings',      icon: Settings },
];

export function Sidebar() {
  const { activeTab, setActiveTab, sidebarOpen, toggleSidebar } = useDashboardStore();
  const profile = useProfileStore((s) => s.profile);
  const { connected, account } = useWallet();
  const stats = useDashboardStats();

  const address = account?.address?.toString() ?? null;

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 240 : 68 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative flex flex-col h-full bg-void-50/60 border-r border-white/5 overflow-hidden shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/5 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-shelby-600 to-shelby-800 flex items-center justify-center shrink-0">
          <Hexagon size={18} className="text-white" />
        </div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="font-display font-bold text-lg text-void-950 whitespace-nowrap"
            >
              ShelbyHub
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={!sidebarOpen ? item.label : undefined}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left
                ${isActive
                  ? 'bg-shelby-500/15 text-shelby-400'
                  : 'text-void-600 hover:text-void-800 hover:bg-white/5'
                }
              `}
            >
              <Icon size={18} className="shrink-0" />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-shelby-400 shrink-0"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Storage usage */}
      {sidebarOpen && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-3 mb-2 p-3 rounded-xl bg-void-200/50 border border-white/5"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-void-600">Storage used</span>
              <span className="text-xs font-mono text-void-700">{formatBytes(stats.totalStorageBytes)}</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${Math.min((stats.totalStorageBytes / (100 * 1024 * 1024)) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-void-500 mt-1.5">{stats.totalFiles} files</p>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Public profile link */}
      {sidebarOpen && profile && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-3 mb-2"
          >
            <Link
              href={`/u/${profile.username}`}
              target="_blank"
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-shelby-500/20 text-shelby-400 hover:bg-shelby-500/10 text-xs font-medium transition-colors"
            >
              <User size={13} />
              <span className="flex-1">View public profile</span>
              <ExternalLink size={11} />
            </Link>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Wallet section */}
      <div className="p-3 border-t border-white/5 shrink-0">
        {connected && address ? (
          <div className={`flex items-center gap-2 ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-shelby-600 to-shelby-900 flex items-center justify-center shrink-0">
              <div className="w-2 h-2 rounded-full bg-shelby-300 animate-pulse-slow" />
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  className="min-w-0"
                >
                  <p className="text-xs font-medium text-void-800 truncate">{profile?.displayName ?? 'Connected'}</p>
                  <p className="text-xs font-mono text-void-500">{truncateAddress(address, 4)}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className={sidebarOpen ? '' : 'flex justify-center'}>
            {sidebarOpen ? (
              <WalletConnect className="w-full justify-center" />
            ) : (
              <WalletConnect variant="button" className="!px-2 !py-2 aspect-square" />
            )}
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute top-1/2 -right-3 z-10 w-6 h-6 rounded-full bg-void-300 border border-white/10 flex items-center justify-center text-void-600 hover:text-void-800 hover:bg-void-400 transition-all shadow-md"
      >
        {sidebarOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
      </button>
    </motion.aside>
  );
}
