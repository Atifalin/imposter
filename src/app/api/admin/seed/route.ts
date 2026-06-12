import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { headers } from 'next/headers';
import { wordDatabase } from '../../../../../prisma/seed-data';

export async function POST(req: Request) {
  try {
    const headersList = await headers();
    const adminPassword = headersList.get('X-Admin-Password');
    
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Clear existing words and recreate defaults
    await prisma.word.deleteMany();
    
    const created = await prisma.$transaction(
      wordDatabase.map(w => prisma.word.create({ 
        data: {
          word: w.word,
          category: w.category,
          mediumHint: w.mediumHint,
          easyHint: w.easyHint,
          hardHint: w.hardHint
        } 
      }))
    );

    return NextResponse.json({ success: true, count: created.length });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
