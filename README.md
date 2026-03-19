# ShelbyHub 🔗⛓️

> Web3 Link-in-Bio + Decentralized File Storage  
> Powered by **Shelby Protocol** × **Aptos**

---

## ✨ Features

| Feature | Status |
|---------|--------|
| 🔗 Link-in-bio profile page | ✅ |
| 📁 Decentralized file upload (Shelby Protocol) | ✅ |
| 👛 Aptos wallet connect (Petra, Martian, Pontem…) | ✅ |
| 📊 Dashboard with stats | ✅ |
| 🌐 Public shareable profile `/u/username` | ✅ |
| 📱 QR code generator | ✅ |
| 🔄 Drag-and-drop link reorder | ✅ |
| 🖼️ Image/video preview | ✅ |
| 🌗 Dark mode (default) | ✅ |
| 📦 Multi-file upload with progress | ✅ |

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in at minimum:
- `NEXT_PUBLIC_APTOS_API_KEY` — from [Aptos Developer Portal](https://developers.aptoslabs.com)
- `NEXT_PUBLIC_APP_URL` — your deployment URL

### 3. Run locally

```bash
npm run dev
# → http://localhost:3000
```

---

## 📦 Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout + metadata
│   ├── globals.css               # Design system CSS
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   └── page.tsx              # Dashboard (links, files, upload, settings)
│   └── u/[username]/
│       ├── layout.tsx            # Dynamic OG metadata
│       └── page.tsx              # Public profile page
│
├── components/
│   ├── WalletConnect.tsx         # Wallet picker modal
│   ├── FileUpload.tsx            # Drag-drop uploader
│   ├── FileGrid.tsx              # Blob gallery with detail modal
│   ├── LinkManager.tsx           # DnD link CRUD
│   ├── ProfileCard.tsx           # Public-facing profile card + QR
│   ├── ProfileSettings.tsx       # Edit profile form
│   ├── Sidebar.tsx               # Collapsible dashboard nav
│   └── StatsCard.tsx             # Animated stats counter
│
├── hooks/
│   └── index.ts                  # useUploadBlobs, useAccountBlobs, etc.
│
├── lib/
│   ├── shelbyClient.ts           # Shelby SDK client + upload flow
│   ├── store.ts                  # Zustand stores (profile, dashboard)
│   └── wallet.ts                 # Wallet utilities
│
├── providers/
│   └── AppProviders.tsx          # QueryClient + AptosWallet + Toaster
│
└── types/
    └── index.ts                  # All TypeScript types
```

---

## 🔌 Shelby Protocol Integration

The `ShelbySDKClient` in `src/lib/shelbyClient.ts` implements the full upload flow:

```
File → encode (erasure coding) → register on-chain (wallet sign) → upload to RPC nodes
```

### When `@shelby-protocol/sdk` ships

Replace the stub internals with real SDK calls:

```ts
import { ShelbyClient, Network } from '@shelby-protocol/sdk';

const client = new ShelbyClient({ network: Network.SHELBYNET });

// Real upload:
const result = await client.uploadBlob({ file, epochs: 1 });
```

The public API (`useUploadBlobs`, `useAccountBlobs`) stays **identical** — no component changes needed.

---

## 👛 Wallet Integration

Uses `@aptos-labs/wallet-adapter-react`. Supported wallets detected automatically:
- **Petra** — Official Aptos wallet
- **Martian** — Feature-rich option
- **Pontem** — Multi-chain DeFi
- **Rise** — Fast & secure

`autoConnect: false` — wallet never connects without user action.

---

## 🌐 Deploy to Vercel

```bash
# 1. Push to GitHub
git init && git add . && git commit -m "init ShelbyHub"
git remote add origin https://github.com/yourname/shelbyhub
git push -u origin main

# 2. Import at vercel.com/new
# 3. Set env vars from .env.example
# 4. Deploy → live in ~60s
```

---

## 🔐 Advanced Roadmap

- [ ] On-chain username registry (Move smart contract)
- [ ] Token-gated files (APT / ShelbyUSD paywall)
- [ ] Encryption via ACE SDK
- [ ] Ceramic Network profile persistence
- [ ] ENS-style `.shelby` username domains
- [ ] Analytics dashboard (views, clicks)
- [ ] Multi-wallet (sign once, update everywhere)

---

## 📄 License

MIT © ShelbyHub
