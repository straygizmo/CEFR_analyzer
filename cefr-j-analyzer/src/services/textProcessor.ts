import { getLemma } from '../data/lemmatization-map';

// Simple POS tagging approximation without external libraries
export interface Token {
  word: string;
  pos: string; // part of speech
  lemma: string; // base form
}

export interface Sentence {
  text: string;
  tokens: Token[];
}

export interface ProcessedText {
  sentences: Sentence[];
  tokens: Token[];
  wordCount: number;
  sentenceCount: number;
  uniqueWords: Set<string>;
}

// Common function words for basic POS tagging
const DETERMINERS = new Set(['a', 'an', 'the', 'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her', 'its', 'our', 'their']);
const PREPOSITIONS = new Set(['in', 'on', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'under', 'over', 'near']);
const CONJUNCTIONS = new Set(['and', 'or', 'but', 'nor', 'so', 'yet', 'for', 'because', 'although', 'since', 'unless', 'while', 'if']);
const PRONOUNS = new Set(['i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'myself', 'yourself', 'himself', 'herself', 'itself', 'ourselves', 'themselves']);
const AUXILIARIES = new Set(['am', 'is', 'are', 'was', 'were', 'been', 'being', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should', 'may', 'might', 'must', 'can', 'could']);
const ADVERBS = new Set(['very', 'really', 'quite', 'just', 'almost', 'also', 'often', 'always', 'usually', 'sometimes', 'never', 'here', 'there', 'now', 'then', 'today', 'yesterday', 'tomorrow', 'soon', 'already', 'still']);

// Common verb endings for simple detection
const VERB_ENDINGS = ['ing', 'ed', 's', 'es'];
const ADJECTIVE_ENDINGS = ['able', 'ible', 'ful', 'less', 'ous', 'ive', 'al', 'ic'];
const ADVERB_ENDINGS = ['ly'];

export function tokenize(text: string): string[] {
  // Basic tokenization - split by whitespace and punctuation
  return text
    .toLowerCase()
    .replace(/[^\w\s'-]/g, ' ') // Keep apostrophes and hyphens
    .split(/\s+/)
    .filter(word => word.length > 0);
}

export function splitSentences(text: string): string[] {
  // Simple sentence splitting by common punctuation
  return text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

export function simplePosTagger(word: string): string {
  const lower = word.toLowerCase();
  
  // Check against word lists
  if (DETERMINERS.has(lower)) return 'DET';
  if (PREPOSITIONS.has(lower)) return 'PREP';
  if (CONJUNCTIONS.has(lower)) return 'CONJ';
  if (PRONOUNS.has(lower)) return 'PRON';
  if (AUXILIARIES.has(lower)) return 'AUX';
  if (ADVERBS.has(lower)) return 'ADV';
  
  // Check endings
  if (ADVERB_ENDINGS.some(ending => lower.endsWith(ending))) return 'ADV';
  if (VERB_ENDINGS.some(ending => lower.endsWith(ending))) return 'VERB';
  if (ADJECTIVE_ENDINGS.some(ending => lower.endsWith(ending))) return 'ADJ';
  
  // Default to noun (most common content word)
  return 'NOUN';
}

export function lemmatize(word: string, pos: string): string {
  // Use the lemmatization map which has comprehensive coverage
  // pos parameter kept for API compatibility but not used with dictionary approach
  return getLemma(word);
}

export function processText(text: string): ProcessedText {
  const sentences = splitSentences(text);
  const processedSentences: Sentence[] = [];
  const allTokens: Token[] = [];
  const uniqueWords = new Set<string>();
  
  for (const sentence of sentences) {
    const words = tokenize(sentence);
    const tokens: Token[] = [];
    
    for (const word of words) {
      const pos = simplePosTagger(word);
      const lemma = lemmatize(word, pos);
      
      const token: Token = { word, pos, lemma };
      tokens.push(token);
      allTokens.push(token);
      uniqueWords.add(lemma);
    }
    
    processedSentences.push({ text: sentence, tokens });
  }
  
  return {
    sentences: processedSentences,
    tokens: allTokens,
    wordCount: allTokens.length,
    sentenceCount: sentences.length,
    uniqueWords
  };
}

// Calculate readability metrics
export function calculateARI(text: string): number {
  const chars = text.replace(/\s/g, '').length;
  const words = tokenize(text).length;
  const sentences = splitSentences(text).length;
  
  if (words === 0 || sentences === 0) return 0;
  
  // ARI formula: 4.71(characters/words) + 0.5(words/sentences) - 21.43
  return 4.71 * (chars / words) + 0.5 * (words / sentences) - 21.43;
}

// Extract noun phrases (simplified)
export function extractNounPhrases(sentence: Sentence): string[][] {
  const nounPhrases: string[][] = [];
  let currentPhrase: string[] = [];
  let inNounPhrase = false;
  
  for (const token of sentence.tokens) {
    if (token.pos === 'DET' || token.pos === 'ADJ') {
      if (!inNounPhrase) {
        inNounPhrase = true;
        currentPhrase = [];
      }
      currentPhrase.push(token.word);
    } else if (token.pos === 'NOUN' && (inNounPhrase || currentPhrase.length === 0)) {
      currentPhrase.push(token.word);
      nounPhrases.push([...currentPhrase]);
      currentPhrase = [];
      inNounPhrase = false;
    } else {
      if (currentPhrase.length > 0) {
        currentPhrase = [];
        inNounPhrase = false;
      }
    }
  }
  
  return nounPhrases;
}

// Count content words (nouns, verbs, adjectives, adverbs)
export function countContentWords(tokens: Token[]): { [pos: string]: number } {
  const counts: { [pos: string]: number } = {};
  const contentPOS = ['NOUN', 'VERB', 'ADJ', 'ADV'];
  
  for (const token of tokens) {
    if (contentPOS.includes(token.pos)) {
      counts[token.pos] = (counts[token.pos] || 0) + 1;
    }
  }
  
  return counts;
}

// Get unique POS types count
export function getUniquePOSCount(tokens: Token[]): number {
  const uniquePOS = new Set(tokens.map(t => t.pos));
  return uniquePOS.size;
}