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
    const { socket_id, channel_name } = body;

    // Only allow users to subscribe to their own private channel
    const expectedChannel = `private-user-${user.id}`;
    if (channel_name !== expectedChannel) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const auth = pusher.authenticate(socket_id, channel_name);
    
    return NextResponse.json(auth);
  } catch (error) {
    console.error('[Pusher Auth] Error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}