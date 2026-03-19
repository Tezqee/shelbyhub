/**
 * profileStore.ts
 * Global profile + modal state via Zustand.
 * Profile data is persisted to localStorage so users don't lose their
 * links on refresh. In production, back this with a decentralized DB
 * (e.g. Ceramic Network, Tableland, or a simple on-chain smart contract).
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import type { UserProfile, SocialLink, BlobMetadata, DashboardTab, ModalState } from '@/types';

// ─── Profile Store ────────────────────────────────────────────────────────────

interface ProfileStore {
  profile: UserProfile | null;
  blobs: BlobMetadata[];
  isLoading: boolean;

  // Profile actions
  setProfile: (profile: UserProfile) => void;
  updateProfile: (patch: Partial<Omit<UserProfile, 'links'>>) => void;
  clearProfile: () => void;

  // Link actions
  addLink: (link: Omit<SocialLink, 'id' | 'clicks' | 'order' | 'createdAt' | 'active'>) => void;
  updateLink: (id: string, patch: Partial<SocialLink>) => void;
  removeLink: (id: string) => void;
  reorderLinks: (orderedIds: string[]) => void;
  incrementLinkClicks: (id: string) => void;

  // Blob actions
  addBlob: (blob: BlobMetadata) => void;
  removeBlob: (id: string) => void;
  updateBlobStatus: (id: string, status: BlobMetadata['status']) => void;

  // Init from wallet
  initProfileFromWallet: (address: string) => void;
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set, get) => ({
      profile: null,
      blobs: [],
      isLoading: false,

      setProfile: (profile) => set({ profile }),

      updateProfile: (patch) =>
        set((state) => ({
          profile: state.profile
            ? { ...state.profile, ...patch, updatedAt: new Date().toISOString() }
            : null,
        })),

      clearProfile: () => set({ profile: null, blobs: [] }),

      addLink: (linkData) =>
        set((state) => {
          if (!state.profile) return state;
          const newLink: SocialLink = {
            id: nanoid(),
            clicks: 0,
            order: state.profile.links.length,
            createdAt: new Date().toISOString(),
            active: true,
            ...linkData,
          };
          return {
            profile: {
              ...state.profile,
              links: [...state.profile.links, newLink],
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      updateLink: (id, patch) =>
        set((state) => {
          if (!state.profile) return state;
          return {
            profile: {
              ...state.profile,
              links: state.profile.links.map((l) => (l.id === id ? { ...l, ...patch } : l)),
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      removeLink: (id) =>
        set((state) => {
          if (!state.profile) return state;
          return {
            profile: {
              ...state.profile,
              links: state.profile.links.filter((l) => l.id !== id),
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      reorderLinks: (orderedIds) =>
        set((state) => {
          if (!state.profile) return state;
          const linkMap = new Map(state.profile.links.map((l) => [l.id, l]));
          const reordered = orderedIds
            .map((id, index) => {
              const link = linkMap.get(id);
              return link ? { ...link, order: index } : null;
            })
            .filter(Boolean) as SocialLink[];
          return {
            profile: {
              ...state.profile,
              links: reordered,
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      incrementLinkClicks: (id) =>
        set((state) => {
          if (!state.profile) return state;
          return {
            profile: {
              ...state.profile,
              links: state.profile.links.map((l) =>
                l.id === id ? { ...l, clicks: l.clicks + 1 } : l
              ),
            },
          };
        }),

      addBlob: (blob) =>
        set((state) => ({ blobs: [blob, ...state.blobs] })),

      removeBlob: (id) =>
        set((state) => ({ blobs: state.blobs.filter((b) => b.id !== id) })),

      updateBlobStatus: (id, status) =>
        set((state) => ({
          blobs: state.blobs.map((b) => (b.id === id ? { ...b, status } : b)),
        })),

      initProfileFromWallet: (address) => {
        const existing = get().profile;
        if (existing?.walletAddress === address) return;

        // Create a fresh profile for this wallet
        const shortAddr = `${address.slice(0, 6)}…${address.slice(-4)}`;
        const profile: UserProfile = {
          username: `user_${address.slice(2, 10).toLowerCase()}`,
          walletAddress: address,
          displayName: shortAddr,
          bio: '',
          avatarUrl: null,
          links: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          theme: {
            primaryColor: '#14b8a6',
            backgroundStyle: 'dark',
            cardStyle: 'glass',
          },
          verified: false,
          totalViews: 0,
        };
        set({ profile });
      },
    }),
    {
      name: 'shelbyhub-profile',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ profile: state.profile, blobs: state.blobs }),
    }
  )
);

// ─── Dashboard UI Store ───────────────────────────────────────────────────────

interface DashboardStore {
  activeTab: DashboardTab;
  modal: ModalState;
  sidebarOpen: boolean;

  setActiveTab: (tab: DashboardTab) => void;
  openModal: (type: ModalState['type'], payload?: unknown) => void;
  closeModal: () => void;
  toggleSidebar: () => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  activeTab: 'overview',
  modal: { open: false, type: null },
  sidebarOpen: true,

  setActiveTab: (tab) => set({ activeTab: tab }),

  openModal: (type, payload) => set({ modal: { open: true, type, payload } }),

  closeModal: () => set({ modal: { open: false, type: null } }),

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
