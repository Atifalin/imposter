import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// Basic middleware for admin
const checkAdmin = (req: Request) => {
  const auth = req.headers.get('Authorization');
  return auth === 'Bearer admin123';
};

export async function DELETE(req: Request) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Delete finished games, OR games older than 24 hours (stale)
    const result = await prisma.room.deleteMany({
      where: {
        OR: [
          { status: 'finished' },
          { createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
        ]
      }
    });

    return NextResponse.json({ message: 'Success', deletedRooms: result.count });
  } catch (error) {
    console.error('Error clearing stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
