// POS (Part of Speech) Index for CEFR-J Vocabulary
// This file provides word-to-POS mappings to improve POS tagging accuracy

import vocabularyA1 from './vocabulary-a1.json';
import vocabularyA2 from './vocabulary-a2.json';
import vocabularyB1 from './vocabulary-b1.json';
import vocabularyB2 from './vocabulary-b2.json';
import vocabularyC1 from './vocabulary-c1.json';
import vocabularyC2 from './vocabulary-c2.json';

interface VocabularyEntry {
  word: string;
  pos: string;
}

// Build POS index from vocabulary data
const posIndex: { [word: string]: Set<string> } = {};

function addToPosIndex(vocabularyData: VocabularyEntry[]) {
  for (const entry of vocabularyData) {
    const word = entry.word.toLowerCase();
    if (!posIndex[word]) {
      posIndex[word] = new Set();
    }
    posIndex[word].add(entry.pos);
  }
}

// Add all vocabulary data to the index
addToPosIndex(vocabularyA1 as VocabularyEntry[]);
addToPosIndex(vocabularyA2 as VocabularyEntry[]);
addToPosIndex(vocabularyB1 as VocabularyEntry[]);
addToPosIndex(vocabularyB2 as VocabularyEntry[]);
addToPosIndex(vocabularyC1 as VocabularyEntry[]);
addToPosIndex(vocabularyC2 as VocabularyEntry[]);

// Export function to get POS for a word
export function getWordPOS(word: string): string[] {
  const lowerWord = word.toLowerCase();
  return posIndex[lowerWord] ? Array.from(posIndex[lowerWord]) : [];
}

// Export function to check if a word can be a verb
export function canBeVerb(word: string): boolean {
  const posList = getWordPOS(word);
  return posList.some(pos => pos === 'verb');
}

// Export raw index for debugging
export { posIndex };