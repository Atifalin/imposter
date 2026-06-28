import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

const checkAdmin = (req: Request) => {
  const auth = req.headers.get('Authorization');
  return auth === 'Bearer admin123';
};

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.word.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting word:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { category, word, easyHint, mediumHint, hardHint } = body;

    const updated = await prisma.word.update({
      where: { id },
      data: {
        category,
        word,
        easyHint,
        mediumHint,
        hardHint
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating word:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
