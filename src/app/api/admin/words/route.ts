import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// Basic middleware for admin - in production we'd want actual auth
const checkAdmin = (req: Request) => {
  const auth = req.headers.get('Authorization');
  return auth === 'Bearer admin123';
};

export async function GET(req: Request) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const category = url.searchParams.get('category');

    const words = await prisma.word.findMany({
      where: category ? { category } : undefined,
      orderBy: { category: 'asc' }
    });

    return NextResponse.json(words);
  } catch (error) {
    console.error('Error fetching words:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!checkAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { category, word, easyHint, mediumHint, hardHint } = body;

    if (!category || !word || !mediumHint) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newWord = await prisma.word.create({
      data: {
        category,
        word,
        easyHint: easyHint || mediumHint,
        mediumHint,
        hardHint: hardHint || mediumHint,
        isCustom: true
      }
    });

    return NextResponse.json(newWord);
  } catch (error) {
    console.error('Error creating word:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
