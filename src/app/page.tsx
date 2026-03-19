'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import {
  Hexagon, Link2, HardDrive, Shield, Zap, Globe,
  ArrowRight, ChevronRight, Upload, Eye, MousePointerClick,
  Github, Twitter,
} from 'lucide-react';
import { WalletConnect } from '@/components/WalletConnect';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useRouter } from 'next/navigation';

// ─── Animated grid background ────────────────────────────────────────────────
function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Grid lines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(20,184,166,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(20,184,166,0.07) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 100%)',
        }}
      />
      {/* Top center glow */}
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-3xl"
        style={{ background: 'radial-gradient(ellipse, rgba(20,184,166,0.12) 0%, transparent 70%)' }}
      />
      {/* Bottom gradient */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-void-DEFAULT to-transparent" />
    </div>
  );
}

// ─── Floating orb ────────────────────────────────────────────────────────────
function FloatingOrb({ delay, x, y, size, color }: {
  delay: number; x: string; y: string; size: number; color: string;
}) {
  return (
    <motion.div
      className="absolute rounded-full blur-2xl pointer-events-none"
      style={{ left: x, top: y, width: size, height: size, background: color }}
      animate={{ y: [-10, 10, -10], opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 6 + delay, repeat: Infinity, delay, ease: 'easeInOut' }}
    />
  );
}

// ─── Feature card ─────────────────────────────────────────────────────────────
function FeatureCard({
  icon: Icon, title, description, color, delay,
}: {
  icon: React.ElementType; title: string; description: string; color: string; delay: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, type: 'spring', stiffness: 200, damping: 24 }}
      className="group relative p-6 rounded-2xl bg-void-100/40 border border-white/5 hover:border-white/10 transition-all overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: `radial-gradient(ellipse at 30% 30%, ${color}12 0%, transparent 60%)` }}
      />
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
        style={{ background: `${color}1a` }}
      >
        <Icon size={18} style={{ color }} />
      </div>
      <h3 className="font-display font-bold text-void-900 mb-2">{title}</h3>
      <p className="text-sm text-void-600 leading-relaxed">{description}</p>
    </motion.div>
  );
}

// ─── Stat pill ────────────────────────────────────────────────────────────────
function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center px-6 py-4 rounded-2xl bg-void-100/40 border border-white/5">
      <div className="font-display font-bold text-2xl text-gradient">{value}</div>
      <div className="text-xs text-void-500 mt-0.5">{label}</div>
    </div>
  );
}

// ─── Demo profile mockup ──────────────────────────────────────────────────────
function DemoMockup() {
  const links = [
    { label: 'Portfolio', color: '#14b8a6' },
    { label: 'Twitter / X', color: '#818cf8' },
    { label: 'GitHub',    color: '#fb923c' },
    { label: 'Blog',      color: '#f472b6' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 26 }}
      className="relative w-full max-w-xs mx-auto"
    >
      {/* Glow */}
      <div className="absolute inset-0 rounded-3xl blur-2xl opacity-30" style={{ background: 'radial-gradient(ellipse, #14b8a6 0%, transparent 70%)' }} />

      <div className="relative glass rounded-3xl p-6 space-y-4">
        {/* Avatar + name */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-shelby-600 to-shelby-900 mx-auto flex items-center justify-center animate-float">
            <span className="text-2xl font-display font-bold text-shelby-100">S</span>
          </div>
          <div>
            <p className="font-display font-bold text-void-950">ShelbyDev</p>
            <p className="text-xs text-void-500 font-mono">@shelbydev</p>
          </div>
          <p className="text-xs text-void-600">Web3 builder · Shelby Protocol</p>
        </div>

        {/* Links */}
        <div className="space-y-2">
          {links.map((l, i) => (
            <motion.div
              key={l.label}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.08 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-void-200/60 border border-white/5"
            >
              <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
              <span className="text-sm text-void-800">{l.label}</span>
              <ChevronRight size={12} className="ml-auto text-void-500" />
            </motion.div>
          ))}
        </div>

        {/* File badge */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-shelby-500/10 border border-shelby-500/20">
          <HardDrive size={13} className="text-shelby-400" />
          <span className="text-xs text-shelby-400">4 files on Shelby</span>
          <Upload size={11} className="ml-auto text-shelby-500" />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main landing page ────────────────────────────────────────────────────────
export default function LandingPage() {
  const { connected } = useWallet();
  const router = useRouter();

  // If already connected, offer quick jump to dashboard
  const ctaLabel = connected ? 'Go to Dashboard' : 'Launch App';
  const ctaHref = '/dashboard';

  const features = [
    {
      icon: Link2,
      title: 'Link-in-Bio Hub',
      description: 'Create a beautiful, shareable profile page with all your important links in one place. Drag to reorder, toggle visibility, and track clicks.',
      color: '#14b8a6',
    },
    {
      icon: HardDrive,
      title: 'Decentralized Storage',
      description: 'Upload files to the Shelby Protocol network. Your data lives on a decentralized hot-storage layer — always available, censorship-resistant.',
      color: '#818cf8',
    },
    {
      icon: Shield,
      title: 'Aptos Wallet Auth',
      description: 'No passwords, no email. Connect your Petra or Martian wallet to authenticate. Your wallet is your identity on ShelbyHub.',
      color: '#fb923c',
    },
    {
      icon: Zap,
      title: 'Instant CDN',
      description: 'Files served via the Shelby gateway — fast global access with blob IDs as permanent content addresses. Share with one URL.',
      color: '#f472b6',
    },
    {
      icon: Globe,
      title: 'Public Profile URL',
      description: 'Get your own shareable page at /u/username. Share it on Twitter, Instagram, or anywhere — one link for everything you do.',
      color: '#34d399',
    },
    {
      icon: Eye,
      title: 'Analytics (soon)',
      description: 'Track profile views, link clicks, and file downloads. Understand your audience without sacrificing their privacy.',
      color: '#fbbf24',
    },
  ];

  return (
    <div className="min-h-screen bg-void-DEFAULT text-void-950 overflow-x-hidden">
      {/* ── NAV ── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 h-16 bg-void-DEFAULT/80 backdrop-blur-md border-b border-white/5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-shelby-600 to-shelby-800 flex items-center justify-center">
            <Hexagon size={15} className="text-white" />
          </div>
          <span className="font-display font-bold text-lg text-void-950">ShelbyHub</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="hidden sm:flex text-sm text-void-600 hover:text-void-800 transition-colors"
          >
            Dashboard
          </Link>
          <WalletConnect />
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-16">
        <HeroBackground />

        {/* Floating orbs */}
        <FloatingOrb delay={0}   x="10%"  y="20%"  size={200} color="rgba(20,184,166,0.08)" />
        <FloatingOrb delay={2}   x="80%"  y="30%"  size={150} color="rgba(129,140,248,0.06)" />
        <FloatingOrb delay={1}   x="60%"  y="70%"  size={180} color="rgba(20,184,166,0.05)" />

        <div className="relative z-10 max-w-6xl w-full mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — copy */}
          <div className="space-y-6">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-shelby-500/10 border border-shelby-500/20 text-xs font-medium text-shelby-400"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-shelby-400 animate-pulse-slow" />
              Built on Shelby Protocol × Aptos
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-tight">
                Your Web3<br />
                <span className="text-gradient">Link Hub</span>
              </h1>
            </motion.div>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-void-600 max-w-md leading-relaxed"
            >
              One page for all your links. Decentralized file sharing powered by Shelby Protocol. 
              No server, no middleman — just your wallet.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-3"
            >
              <Link
                href={ctaHref}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-shelby-600 hover:bg-shelby-500 text-white font-display font-semibold text-sm transition-all btn-glow"
              >
                {ctaLabel} <ArrowRight size={15} />
              </Link>
              <Link
                href="/u/demo"
                className="flex items-center gap-2 px-6 py-3 rounded-xl glass glass-hover text-void-700 font-display font-semibold text-sm transition-all"
              >
                <Eye size={15} /> See Example
              </Link>
            </motion.div>

            {/* Stats pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-3 pt-2"
            >
              <StatPill value="100MB" label="Max file size" />
              <StatPill value="APT" label="Pay with Aptos" />
              <StatPill value="∞" label="Public links" />
            </motion.div>
          </div>

          {/* Right — mockup */}
          <div className="hidden lg:flex justify-center">
            <DemoMockup />
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="relative py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <motion.p
              className="text-xs font-medium text-shelby-400 uppercase tracking-widest mb-3"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Everything you need
            </motion.p>
            <motion.h2
              className="font-display font-bold text-4xl text-void-950"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Built for the decentralized web
            </motion.h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <FeatureCard key={f.title} {...f} delay={i * 0.05} />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-6 bg-void-50/30">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-medium text-shelby-400 uppercase tracking-widest mb-3">Simple setup</p>
          <h2 className="font-display font-bold text-4xl text-void-950 mb-12">Up in 3 steps</h2>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: '01', icon: Shield, title: 'Connect Wallet', desc: 'Click "Connect Wallet" and choose Petra, Martian, or any Aptos wallet.' },
              { step: '02', icon: Link2, title: 'Add Your Links', desc: 'Build your link-in-bio. Drag to reorder, edit titles, toggle visibility.' },
              { step: '03', icon: Upload, title: 'Upload & Share', desc: 'Upload files to Shelby. Get a permanent blob URL to share anywhere.' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-void-100/40 border border-white/5"
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-shelby-500/15 flex items-center justify-center">
                    <item.icon size={20} className="text-shelby-400" />
                  </div>
                  <span className="absolute -top-2 -right-2 text-xs font-mono font-bold text-shelby-500">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-display font-bold text-void-900">{item.title}</h3>
                <p className="text-sm text-void-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12"
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-shelby-600 hover:bg-shelby-500 text-white font-display font-bold text-base transition-all btn-glow"
            >
              Get started for free <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── TECH STACK BANNER ── */}
      <section className="py-16 px-6 border-y border-white/5">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-medium text-void-500 uppercase tracking-widest mb-8">
            Powered by
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 opacity-60">
            {[
              { name: 'Shelby Protocol', icon: '🔷' },
              { name: 'Aptos', icon: '⚡' },
              { name: 'Next.js 15', icon: '▲' },
              { name: 'React Query', icon: '⚛️' },
              { name: 'Tailwind CSS', icon: '💨' },
              { name: 'Vercel', icon: '▼' },
            ].map((tech) => (
              <div
                key={tech.name}
                className="flex items-center gap-2 text-sm text-void-600 font-medium"
              >
                <span>{tech.icon}</span>
                {tech.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-shelby-600 to-shelby-800 flex items-center justify-center">
              <Hexagon size={13} className="text-white" />
            </div>
            <span className="font-display font-bold text-void-700">ShelbyHub</span>
          </div>
          <p className="text-xs text-void-500 text-center">
            Decentralized link-in-bio + file storage · Built with Shelby Protocol
          </p>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/Tezqee"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-void-500 hover:text-void-700 hover:bg-white/5 transition-colors"
            >
              <Github size={16} />
            </a>
            <a
              href="https://x.com/Tezqee"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-void-500 hover:text-void-700 hover:bg-white/5 transition-colors flex items-center justify-center"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
