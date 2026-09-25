import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/server-auth';
import { AppShell } from '@/components/app-shell';
import type { UserProfile } from '@/lib/types';

function serializeDates<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();
  if (!user) {
    redirect('/');
  }

  const serializedUser = serializeDates(user) as UserProfile;

  return <AppShell user={serializedUser}>{children}</AppShell>;
}

export const dynamic = 'force-dynamic';
