import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  try {
    const headersList = await headers();
    const adminPassword = headersList.get('X-Admin-Password');
    
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { words } = await req.json();

    if (!Array.isArray(words)) {
      return NextResponse.json({ error: 'Words must be an array' }, { status: 400 });
    }

    const created = await prisma.$transaction(
      words.map((w: any) => 
        prisma.word.create({
          data: {
            word: w.word,
            category: w.category,
            mediumHint: w.hint || w.mediumHint || '',
            easyHint: w.easyHint || '',
            hardHint: w.hardHint || ''
          }
        })
      )
    );

    return NextResponse.json({ success: true, count: created.length });
  } catch (error) {
    console.error('Bulk insert error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
