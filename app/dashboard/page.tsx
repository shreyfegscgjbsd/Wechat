import { redirect } from "next/navigation";
import { ConversationList } from "@/components/conversation-list";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/server-auth";
import type { Conversation } from "@/lib/types";

function serializeDates<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export default async function DashboardPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/");
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      members: { some: { userId: user.id } },
    },
    include: {
      members: { include: { user: true } },
      lastMessage: { include: { sender: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const serialized = serializeDates(conversations) as unknown as Conversation[];

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-lg">Conversations</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        <ConversationList conversations={serialized} currentUserId={user.id} />
      </div>
    </div>
  );
}