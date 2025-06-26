// POS (Part of Speech) Index for CEFR-J Vocabulary
// This file provides word-to-POS mappings to improve POS tagging accuracy

import wordLookup from './word_lookup.json';

interface WordLookupEntry {
  base_form: string;
  pos: string;
  CEFR: string;
}

// Build POS index from word lookup data
const posIndex: { [word: string]: Set<string> } = {};

// Process word lookup data to build POS index
for (const [word, entry] of Object.entries(wordLookup as Record<string, WordLookupEntry>)) {
  const lowerWord = word.toLowerCase();
  if (!posIndex[lowerWord]) {
    posIndex[lowerWord] = new Set();
  }
  posIndex[lowerWord].add(entry.pos);
  
  // Also add base form to index if different from word
  const baseForm = entry.base_form.toLowerCase();
  if (baseForm !== lowerWord) {
    if (!posIndex[baseForm]) {
      posIndex[baseForm] = new Set();
    }
    posIndex[baseForm].add(entry.pos);
  }
}

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