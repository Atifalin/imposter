import { PrismaClient } from '@prisma/client';
import { wordDatabase } from './seed-data';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with words...');
  
  for (const entry of wordDatabase) {
    await prisma.word.create({
      data: {
        category: entry.category,
        word: entry.word,
        easyHint: entry.easyHint,
        mediumHint: entry.mediumHint,
        hardHint: entry.hardHint,
      }
    });
  }

  console.log(`Seeded ${wordDatabase.length} words successfully!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
