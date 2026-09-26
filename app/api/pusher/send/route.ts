import { NextRequest, NextResponse } from 'next/server';
import Pusher from 'pusher';
import { getAuthUser } from '@/lib/server-auth';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1',
  useTLS: true,
});

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { event, payload } = body;

    if (!event || !payload) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Send to the user's private channel
    await pusher.trigger(`private-user-${user.id}`, event, payload);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Pusher Send] Error:', error);
    return NextResponse.json({ error: 'Failed to send event' }, { status: 500 });
  }
}