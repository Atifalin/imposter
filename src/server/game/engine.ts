import { randomInt } from 'crypto';
import { prisma } from '../../lib/prisma';
import { PlayerState } from '../../types/player';

export async function selectWord(categories: string[], usedWordIds: string[], difficulty: string) {
  const words = await prisma.word.findMany({
    where: {
      category: { in: categories },
      id: { notIn: usedWordIds }
    }
  });

  if (words.length === 0) {
    // If all words used, reset used words for these categories (or just fetch ignoring usedWordIds)
    const fallbackWords = await prisma.word.findMany({
      where: { category: { in: categories } }
    });
    if (fallbackWords.length === 0) throw new Error('No words found for categories');
    
    const word = fallbackWords[randomInt(0, fallbackWords.length)];
    return {
      word: word,
      hint: difficulty === 'easy' ? word.easyHint : (difficulty === 'hard' ? word.hardHint : word.mediumHint)
    };
  }

  const word = words[randomInt(0, words.length)];
  return {
    word: word,
    hint: difficulty === 'easy' ? word.easyHint : (difficulty === 'hard' ? word.hardHint : word.mediumHint)
  };
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
