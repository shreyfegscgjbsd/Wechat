import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/server-auth';
import { prisma } from '@/lib/prisma';
import { CallHistory } from '@/components/call-history';
import type { CallSession } from '@/lib/types';

function serializeDates<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export default async function CallsPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect('/');
  }

  const calls = await prisma.callSession.findMany({
    where: {
      conversation: {
        members: { some: { userId: user.id } },
      },
    },
    include: {
      conversation: { include: { members: { include: { user: true } } } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const serialized = serializeDates(calls) as unknown as CallSession[];

  return (
    <div className="p-4">
      <h2 className="font-semibold text-lg mb-4">Call History</h2>
      <CallHistory calls={serialized} currentUserId={user.id} />
    </div>
  );
}

export const dynamic = 'force-dynamic';
