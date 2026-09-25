import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/server-auth';
import { requireConversationAccess } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ChatView } from '@/components/chat-view';
import type { Conversation, Message, UserProfile } from '@/lib/types';

function serializeDates<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const user = await getAuthUser();
  if (!user) {
    redirect('/');
  }

  const { conversationId } = await params;

  let conversation;
  try {
    conversation = await requireConversationAccess(conversationId, user.id);
  } catch {
    redirect('/dashboard');
  }

  const messages = await prisma.message.findMany({
    where: { conversationId, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      sender: true,
      reactions: { include: { user: true } },
      replyTo: { include: { sender: true } },
      voice: { include: { mediaAsset: true } },
    },
  });

  const otherMember = conversation.members.find((m: { userId: string }) => m.userId !== user.id);

  const serializedConv = serializeDates(conversation) as unknown as Conversation;
  const serializedMessages = serializeDates(messages.reverse()) as unknown as Message[];
  const serializedUser = serializeDates(user) as UserProfile;

  return (
    <ChatView
      conversation={serializedConv}
      messages={serializedMessages}
      currentUser={serializedUser}
      otherUser={
        serializeDates(
          (otherMember as { user?: UserProfile } | undefined)?.user ?? null,
        ) as UserProfile | null
      }
    />
  );
}

export const dynamic = 'force-dynamic';
