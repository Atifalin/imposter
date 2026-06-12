import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  try {
    const headersList = await headers();
    const adminPassword = headersList.get('X-Admin-Password');
    
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Wait 1 second and then kill the process so Docker/PM2/Nodemon restarts it
    setTimeout(() => {
      process.exit(1);
    }, 1000);

    return NextResponse.json({ success: true, message: 'Server is restarting...' });
  } catch (error) {
    console.error('Restart error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
