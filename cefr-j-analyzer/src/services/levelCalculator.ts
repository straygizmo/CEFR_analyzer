import { ProcessedText, Token, countContentWords, extractNounPhrases, getUniquePOSCount } from './textProcessor';
import { calculateARI } from './textProcessor';
import vocabularyIndex from '../data/vocabulary-index.json';

// Word frequency data (simplified - in production, load from external source)
const WORD_FREQUENCIES: { [word: string]: number } = {
  'the': 1, 'be': 2, 'to': 3, 'of': 4, 'and': 5, 'a': 6, 'in': 7, 'that': 8,
  'have': 9, 'i': 10, 'it': 11, 'for': 12, 'not': 13, 'on': 14, 'with': 15,
  'he': 16, 'as': 17, 'you': 18, 'do': 19, 'at': 20
  // Add more as needed
};

export interface VocabularyMetrics {
  avrDiff: number;
  bperA: number;
  cvv1: number;
  avrFreqRank: number;
  ari: number;
  vperSent: number;
  posTypes: number;
  lenNP: number;
}

export interface VocabularyLevel {
  level: string;
  score: number;
  metrics: VocabularyMetrics;
  wordDistribution: { [level: string]: number };
  coloredText: ColoredWord[];
}

export interface ColoredWord {
  word: string;
  level: string;
  color: string;
  bold: boolean;
}

// Reference values for each CEFR level
const REFERENCE_VALUES = {
  A1: { avrDiff: 1.28, bperA: 0.06, cvv1: 1.93, avrFreqRank: 367.99, ari: 4.10, vperSent: 1.51, posTypes: 7.16, lenNP: 2.94 },
  A2: { avrDiff: 1.44, bperA: 0.12, cvv1: 2.95, avrFreqRank: 445.92, ari: 6.22, vperSent: 2.05, posTypes: 8.14, lenNP: 3.36 },
  B1: { avrDiff: 1.57, bperA: 0.18, cvv1: 3.90, avrFreqRank: 514.55, ari: 7.82, vperSent: 2.66, posTypes: 8.73, lenNP: 3.64 },
  B2: { avrDiff: 1.74, bperA: 0.26, cvv1: 4.67, avrFreqRank: 613.05, ari: 9.19, vperSent: 2.95, posTypes: 9.04, lenNP: 3.99 },
  C1: { avrDiff: 1.91, bperA: 0.36, cvv1: 5.58, avrFreqRank: 739.30, ari: 10.79, vperSent: 3.28, posTypes: 9.36, lenNP: 4.51 }
};

function getWordLevel(word: string): string {
  const levels = (vocabularyIndex as any)[word.toLowerCase()];
  if (!levels || levels.length === 0) return 'NA';
  // Return the lowest level (e.g., if word appears in both A1 and A2, return A1)
  const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  for (const level of levelOrder) {
    if (levels.includes(level)) return level;
  }
  return levels[0];
}

function getWordColor(level: string, isContentWord: boolean): { color: string; bold: boolean } {
  const colorMap: { [key: string]: { color: string; bold: boolean } } = {
    'A1': { color: '#32cd32', bold: false },
    'A2': { color: '#32cd32', bold: true },
    'B1': { color: 'blue', bold: false },
    'B2': { color: 'blue', bold: true },
    'C1': { color: 'red', bold: false },
    'C2': { color: 'red', bold: true },
    'NA': { color: isContentWord ? 'orange' : 'black', bold: false }
  };
  
  return colorMap[level] || { color: 'black', bold: false };
}

function calculateAvrDiff(tokens: Token[]): number {
  const contentPOS = ['NOUN', 'VERB', 'ADJ', 'ADV'];
  const levelValues: { [key: string]: number } = {
    'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6
  };
  
  let sum = 0;
  let count = 0;
  
  for (const token of tokens) {
    if (contentPOS.includes(token.pos)) {
      const level = getWordLevel(token.lemma);
      if (level !== 'NA') {
        sum += levelValues[level] || 3; // Default to B1 if unknown
        count++;
      }
    }
  }
  
  return count > 0 ? sum / count : 1;
}

function calculateBperA(tokens: Token[]): number {
  const contentPOS = ['NOUN', 'VERB', 'ADJ', 'ADV'];
  let aCount = 0;
  let bCount = 0;
  
  for (const token of tokens) {
    if (contentPOS.includes(token.pos)) {
      const level = getWordLevel(token.lemma);
      if (level === 'A1' || level === 'A2') aCount++;
      else if (level === 'B1' || level === 'B2') bCount++;
    }
  }
  
  return aCount > 0 ? bCount / aCount : 0;
}

function calculateCVV1(tokens: Token[]): number {
  const verbs = new Set<string>();
  let totalVerbs = 0;
  
  for (const token of tokens) {
    if (token.pos === 'VERB') {
      verbs.add(token.lemma);
      totalVerbs++;
    }
  }
  
  if (totalVerbs === 0) return 0;
  return verbs.size / Math.sqrt(totalVerbs * 2);
}

function calculateAvrFreqRank(tokens: Token[]): number {
  const ranks: number[] = [];
  
  for (const token of tokens) {
    const rank = WORD_FREQUENCIES[token.lemma] || 1000; // Default high rank for unknown
    ranks.push(rank);
  }
  
  // Sort and exclude 3 least frequent (highest rank numbers)
  ranks.sort((a, b) => a - b);
  if (ranks.length > 3) {
    ranks.splice(-3, 3);
  }
  
  const sum = ranks.reduce((acc, rank) => acc + rank, 0);
  return ranks.length > 0 ? sum / ranks.length : 500;
}

function calculateVperSent(processedText: ProcessedText): number {
  if (processedText.sentenceCount === 0) return 0;
  
  const totalVerbs = processedText.tokens.filter(t => t.pos === 'VERB' || t.pos === 'AUX').length;
  return totalVerbs / processedText.sentenceCount;
}

function calculateLenNP(processedText: ProcessedText): number {
  let totalNPLength = 0;
  let npCount = 0;
  
  for (const sentence of processedText.sentences) {
    const nounPhrases = extractNounPhrases(sentence);
    for (const np of nounPhrases) {
      totalNPLength += np.length;
      npCount++;
    }
  }
  
  return npCount > 0 ? totalNPLength / processedText.sentenceCount : 0;
}

function calculateMetrics(text: string, processedText: ProcessedText): VocabularyMetrics {
  return {
    avrDiff: calculateAvrDiff(processedText.tokens),
    bperA: calculateBperA(processedText.tokens),
    cvv1: calculateCVV1(processedText.tokens),
    avrFreqRank: calculateAvrFreqRank(processedText.tokens),
    ari: calculateARI(text),
    vperSent: calculateVperSent(processedText),
    posTypes: getUniquePOSCount(processedText.tokens),
    lenNP: calculateLenNP(processedText)
  };
}

function normalizeScore(value: number, min: number, max: number): number {
  // Normalize to 0-7 scale
  const normalized = ((value - min) / (max - min)) * 7;
  return Math.max(0, Math.min(7, normalized));
}

function calculateLevelScores(metrics: VocabularyMetrics): { [metric: string]: number } {
  // Define min/max ranges for normalization (based on reference values)
  const ranges = {
    avrDiff: { min: 1.0, max: 2.2 },
    bperA: { min: 0, max: 0.5 },
    cvv1: { min: 1.5, max: 6.0 },
    avrFreqRank: { min: 300, max: 800 },
    ari: { min: 3, max: 12 },
    vperSent: { min: 1, max: 4 }
  };
  
  return {
    avrDiff: normalizeScore(metrics.avrDiff, ranges.avrDiff.min, ranges.avrDiff.max),
    bperA: normalizeScore(metrics.bperA, ranges.bperA.min, ranges.bperA.max),
    cvv1: normalizeScore(metrics.cvv1, ranges.cvv1.min, ranges.cvv1.max),
    avrFreqRank: normalizeScore(metrics.avrFreqRank, ranges.avrFreqRank.min, ranges.avrFreqRank.max),
    ari: normalizeScore(metrics.ari, ranges.ari.min, ranges.ari.max),
    vperSent: normalizeScore(metrics.vperSent, ranges.vperSent.min, ranges.vperSent.max)
  };
}

function determineLevel(metrics: VocabularyMetrics): string {
  // Calculate distances to each reference level
  const distances: { [level: string]: number } = {};
  
  for (const [level, refValues] of Object.entries(REFERENCE_VALUES)) {
    let distance = 0;
    distance += Math.pow(metrics.avrDiff - refValues.avrDiff, 2);
    distance += Math.pow(metrics.bperA - refValues.bperA, 2);
    distance += Math.pow(metrics.cvv1 - refValues.cvv1, 2);
    distance += Math.pow(metrics.avrFreqRank - refValues.avrFreqRank, 2) / 10000; // Scale down
    distance += Math.pow(metrics.ari - refValues.ari, 2);
    distance += Math.pow(metrics.vperSent - refValues.vperSent, 2);
    
    distances[level] = Math.sqrt(distance);
  }
  
  // Find the closest level
  let minDistance = Infinity;
  let closestLevel = 'B1';
  
  for (const [level, distance] of Object.entries(distances)) {
    if (distance < minDistance) {
      minDistance = distance;
      closestLevel = level;
    }
  }
  
  // Add sub-level based on metrics
  const subLevel = metrics.avrDiff < REFERENCE_VALUES[closestLevel as keyof typeof REFERENCE_VALUES].avrDiff ? '.1' : '.2';
  
  return closestLevel + subLevel;
}

function createColoredText(text: string, processedText: ProcessedText): ColoredWord[] {
  const coloredWords: ColoredWord[] = [];
  const contentPOS = ['NOUN', 'VERB', 'ADJ', 'ADV'];
  
  // Create a map of word positions
  const words = text.split(/(\s+|[.,!?;:])/);
  let tokenIndex = 0;
  
  for (const word of words) {
    if (word.match(/^\s*$/) || word.match(/^[.,!?;:]$/)) {
      coloredWords.push({
        word,
        level: 'NA',
        color: 'black',
        bold: false
      });
    } else {
      const token = processedText.tokens[tokenIndex];
      if (token) {
        const level = getWordLevel(token.lemma);
        const isContentWord = contentPOS.includes(token.pos);
        const { color, bold } = getWordColor(level, isContentWord);
        
        coloredWords.push({
          word,
          level,
          color,
          bold
        });
        tokenIndex++;
      }
    }
  }
  
  return coloredWords;
}

function calculateWordDistribution(tokens: Token[]): { [level: string]: number } {
  const distribution: { [level: string]: number } = {
    'A1': 0, 'A2': 0, 'B1': 0, 'B2': 0, 'C1': 0, 'C2': 0, 'NA': 0
  };
  
  const contentPOS = ['NOUN', 'VERB', 'ADJ', 'ADV'];
  
  for (const token of tokens) {
    if (contentPOS.includes(token.pos)) {
      const level = getWordLevel(token.lemma);
      distribution[level] = (distribution[level] || 0) + 1;
    }
  }
  
  return distribution;
}

export function analyzeVocabularyLevel(text: string, processedText: ProcessedText): VocabularyLevel {
  const metrics = calculateMetrics(text, processedText);
  const level = determineLevel(metrics);
  const scores = calculateLevelScores(metrics);
  const overallScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / 6;
  
  return {
    level,
    score: overallScore,
    metrics,
    wordDistribution: calculateWordDistribution(processedText.tokens),
    coloredText: createColoredText(text, processedText)
  };
}