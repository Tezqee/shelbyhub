import type { Metadata } from 'next';

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `@${username}`,
    description: `Check out ${username}'s profile on ShelbyHub.`,
    openGraph: {
      title: `@${username} on ShelbyHub`,
      description: `Links and files shared by ${username}.`,
    },
  };
}

export default function UserProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
