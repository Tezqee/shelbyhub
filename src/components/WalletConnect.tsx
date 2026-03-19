'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, X, ChevronRight, AlertCircle, ExternalLink, Loader2, LogOut, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { truncateAddress, KNOWN_WALLETS } from '@/lib/wallet';
import { useProfileStore } from '@/lib/store';

interface WalletConnectProps {
  variant?: 'button' | 'full';
  className?: string;
}

export function WalletConnect({ variant = 'button', className = '' }: WalletConnectProps) {
  const { wallets, connect, disconnect, connected, account, isLoading } = useWallet();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const initProfile = useProfileStore((s) => s.initProfileFromWallet);
  const clearProfile = useProfileStore((s) => s.clearProfile);

  const address = account?.address?.toString() ?? null;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Merge detected wallets with known wallet info
  const availableWallets = (wallets ?? []).map((w) => {
    const known = KNOWN_WALLETS.find((k) => k.name.toLowerCase() === w.name.toLowerCase());
    return { ...w, icon: (w as any).icon ?? known?.icon, url: known?.url };
  });

  const handleConnect = async (walletName: string) => {
    try {
      await connect(walletName as any);
      const addr = account?.address?.toString();
      if (addr) initProfile(addr);
      setOpen(false);
      toast.success(`Connected to ${walletName}`);
    } catch (err: any) {
      if (err?.name === 'WalletNotReadyError' || err?.message?.includes('not installed')) {
        toast.error(`${walletName} is not installed.`, {
          duration: 5000,
        });
      } else if (err?.name === 'WalletConnectionError') {
        toast.error('Connection rejected by user.');
      } else {
        toast.error(err?.message ?? 'Failed to connect.');
      }
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
    clearProfile();
    toast('Wallet disconnected.', { icon: '👋' });
  };

  const handleCopy = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (connected && address) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-2 rounded-lg glass glass-hover text-sm font-mono text-void-800 hover:text-shelby-400 transition-colors"
          title="Copy address"
        >
          <div className="w-2 h-2 rounded-full bg-shelby-500 animate-pulse-slow" />
          {truncateAddress(address)}
          {copied ? <Check size={12} className="text-shelby-400" /> : <Copy size={12} className="opacity-40" />}
        </button>
        <button
          onClick={handleDisconnect}
          className="p-2 rounded-lg glass glass-hover text-void-700 hover:text-red-400 transition-colors"
          title="Disconnect"
        >
          <LogOut size={15} />
        </button>
      </div>
    );
  }

  const modalNode = mounted ? createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-sm max-h-[85vh] flex flex-col glass rounded-2xl overflow-hidden"
            initial={{ scale: 0.95, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 16 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/5 shrink-0">
              <div>
                <h2 className="font-display font-bold text-lg text-void-950">Connect Wallet</h2>
                <p className="text-sm text-void-700 mt-0.5">Select your Aptos wallet</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-void-700 hover:text-void-900 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Wallet list */}
            <div className="p-3 space-y-1.5 flex-1 overflow-y-auto">
              {availableWallets.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <div className="p-3 rounded-full bg-void-100">
                    <AlertCircle size={20} className="text-void-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-void-900">No wallets found</p>
                    <p className="text-xs text-void-600 mt-1">Install a wallet to continue</p>
                  </div>
                  <a
                    href="https://petra.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-shelby-400 hover:text-shelby-300"
                  >
                    Get Petra Wallet <ExternalLink size={11} />
                  </a>
                </div>
              ) : (
                availableWallets.map((wallet) => (
                  <button
                    key={wallet.name}
                    onClick={() => handleConnect(wallet.name)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group"
                  >
                    {wallet.icon ? (
                      <img
                        src={wallet.icon}
                        alt={wallet.name}
                        className="w-9 h-9 rounded-xl object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${wallet.name}&background=0d9488&color=fff&size=36`;
                        }}
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-void-200 flex items-center justify-center">
                        <Wallet size={16} className="text-void-600" />
                      </div>
                    )}
                    <span className="flex-1 text-left text-sm font-medium text-void-900 group-hover:text-void-950">
                      {wallet.name}
                    </span>
                    <ChevronRight size={14} className="text-void-600 group-hover:text-void-800 transition-colors" />
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-white/5 bg-void-50/30 shrink-0">
              <p className="text-xs text-void-600 text-center">
                By connecting, you agree to our{' '}
                <a href="#" className="text-shelby-400 hover:underline">Terms of Service</a>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  ) : null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-shelby-600 hover:bg-shelby-500 text-white font-display font-semibold text-sm transition-all btn-glow ${className}`}
        disabled={isLoading}
      >
        {isLoading ? <Loader2 size={15} className="animate-spin" /> : <Wallet size={15} />}
        {isLoading ? 'Connecting…' : 'Connect Wallet'}
      </button>

      {modalNode}
    </>
  );
}
