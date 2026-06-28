import { randomInt } from 'crypto';
import { prisma } from '../../lib/prisma';
import { PlayerState } from '../../types/player';

function getHint(word: any, difficulty: string) {
  return difficulty === 'easy' ? word.easyHint : (difficulty === 'hard' ? word.hardHint : word.mediumHint);
}

export async function selectWord(categories: string[], usedWordIds: string[], difficulty: string) {
  // Use count + skip to avoid loading entire table into memory
  const whereClause = {
    category: { in: categories },
    ...(usedWordIds.length > 0 ? { id: { notIn: usedWordIds } } : {})
  };

  const count = await prisma.word.count({ where: whereClause });

  if (count === 0) {
    // All words used — reset and pick from full pool
    const fallbackCount = await prisma.word.count({
      where: { category: { in: categories } }
    });
    if (fallbackCount === 0) throw new Error('No words found for categories');

    const skip = randomInt(0, fallbackCount);
    const words = await prisma.word.findMany({
      where: { category: { in: categories } },
      skip,
      take: 1
    });
    return { word: words[0], hint: getHint(words[0], difficulty) };
  }

  const skip = randomInt(0, count);
  const words = await prisma.word.findMany({
    where: whereClause,
    skip,
    take: 1
  });
  return { word: words[0], hint: getHint(words[0], difficulty) };
}

export function assignRoles(players: PlayerState[], imposterCount: number): Map<string, 'imposter' | 'crew'> {
  const assignments = new Map<string, 'imposter' | 'crew'>();
  const shuffled = [...players];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  shuffled.forEach((player, index) => {
    assignments.set(player.id, index < imposterCount ? 'imposter' : 'crew');
  });

  return assignments;
}

export function selectStartingPlayer(players: PlayerState[]): string {
  return players[randomInt(0, players.length)].id;
}
