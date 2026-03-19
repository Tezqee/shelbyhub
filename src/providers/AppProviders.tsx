'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';

// ─── QueryClient config ───────────────────────────────────────────────────────

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,          // 1 min
        gcTime: 5 * 60 * 1000,         // 5 min
        retry: 2,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === 'undefined') return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

// ─── AppProviders ─────────────────────────────────────────────────────────────

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AptosWalletAdapterProvider
        autoConnect={false}           // ← never auto-connect
        dappConfig={{
          network: 'mainnet' as any,
          aptosApiKeys: process.env.NEXT_PUBLIC_APTOS_API_KEY ? { mainnet: process.env.NEXT_PUBLIC_APTOS_API_KEY } : undefined,
        }}
        onError={(error) => {
          console.error('[WalletAdapter]', error);
        }}
      >
        {children}

        {/* Toast notifications */}
        <Toaster
          position="bottom-right"
          gutter={8}
          containerStyle={{ bottom: 24, right: 24 }}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#161b22',
              color: '#e6edf3',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '10px',
              fontSize: '14px',
              fontFamily: 'var(--font-body)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              padding: '12px 16px',
            },
            success: {
              iconTheme: { primary: '#14b8a6', secondary: '#042f2e' },
            },
            error: {
              iconTheme: { primary: '#f87171', secondary: '#450a0a' },
            },
          }}
        />

        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </AptosWalletAdapterProvider>
    </QueryClientProvider>
  );
}
