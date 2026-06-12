import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const upperCode = code.toUpperCase();
    
    const room = await prisma.room.findUnique({
      where: { code: upperCode },
      include: {
        _count: {
          select: { members: { where: { connected: true } } }
        }
      }
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Return safe info
    return NextResponse.json({
      id: room.id,
      code: room.code,
      status: room.status,
      playerCount: room._count.members
    });
  } catch (error) {
    console.error('Error fetching room:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
