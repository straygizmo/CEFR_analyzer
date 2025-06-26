import type { ProcessedText, Token } from './textProcessor';
import { extractNounPhrases, calculateARI } from './textProcessor';
import { getWordLevel as getWordLevelFromIndex } from '../data/vocabulary-index';
import { cocaFrequency } from '../data/coca-frequency';

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

export interface LevelStatistics {
  count: number;
  avrIdx: number;
  verb: number;
  noun: number;
  adjective: number;
}

export interface VocabularyLevel {
  level: string;
  score: number;
  metrics: VocabularyMetrics;
  wordDistribution: { [level: string]: number };
  coloredText: ColoredWord[];
  metricScores: { [metric: string]: number };
  levelStatistics: { [level: string]: LevelStatistics };
  totalContentWords: number;
  uniqueVerbs: number;
  totalVerbs: number;
  sentenceCount: number;
}

export interface ColoredWord {
  word: string;
  level: string;
  color: string;
  bold: boolean;
}


function getWordLevel(word: string): string {
  return getWordLevelFromIndex(word);
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
  const levelValues: { [key: string]: number } = {
    'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6
  };
  
  let sum = 0;
  let count = 0;
  
  for (const token of tokens) {
    // Check for content words using Penn Treebank tags
    if (token.pos?.startsWith('NN') || token.pos?.startsWith('VB') || 
        token.pos?.startsWith('JJ') || token.pos?.startsWith('RB')) {
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
  let aCount = 0;
  let bCount = 0;
  
  for (const token of tokens) {
    // Check for content words using Penn Treebank tags
    if (token.pos?.startsWith('NN') || token.pos?.startsWith('VB') || 
        token.pos?.startsWith('JJ') || token.pos?.startsWith('RB')) {
      const level = getWordLevel(token.lemma);
      if (level === 'A1' || level === 'A2') aCount++;
      else if (level === 'B1' || level === 'B2') bCount++;
    }
  }
  
  return aCount > 0 ? bCount / aCount : 0;
}

function calculateCVV1(tokens: Token[]): number {
  // CVV1: number of verb types divided by the square root of twice the number of verb tokens
  // Excluding be-verbs as per the paper
  const verbTypes = new Set<string>();
  let verbTokens = 0;
  
  for (const token of tokens) {
    if (token.pos?.startsWith('VB') && token.lemma.toLowerCase() !== 'be') {
      verbTypes.add(token.lemma.toLowerCase());
      verbTokens++;
    }
  }
  
  if (verbTokens === 0) return 0;
  return verbTypes.size / Math.sqrt(2 * verbTokens);
}

function getWordFrequencyRank(word: string): number {
  const rank = cocaFrequency[word.toLowerCase()];
  if (typeof rank === 'number') return rank;
  
  // If not found in COCA, return 10000 (as per paper: items ranked above 10,000 calculated as 10,000)
  return 10000;
}

function calculateAvrFreqRank(tokens: Token[]): number {
  const ranks: number[] = [];
  
  for (const token of tokens) {
    // Include all words, not just content words (as per paper)
    if (token.pos !== 'PUNCT' && token.pos !== 'SPACE') {
      const rank = getWordFrequencyRank(token.lemma);
      ranks.push(Math.min(rank, 10000)); // Cap at 10000 as per paper
    }
  }
  
  if (ranks.length === 0) return 500;
  
  // Sort ranks from lowest (most frequent) to highest (least frequent)
  ranks.sort((a, b) => a - b);
  
  // Exclude the three most infrequent words (highest rank numbers)
  if (ranks.length > 3) {
    ranks.splice(-3, 3);
  }
  
  const sum = ranks.reduce((acc, rank) => acc + rank, 0);
  return ranks.length > 0 ? sum / ranks.length : 500;
}

function calculateVperSent(processedText: ProcessedText): number {
  if (processedText.sentenceCount === 0) return 0;
  
  const totalVerbs = processedText.tokens.filter(t => t.pos?.startsWith('VB') || t.pos === 'MD').length;
  return totalVerbs / processedText.sentenceCount;
}

function calculatePOStypes(processedText: ProcessedText): number {
  // Average number of distinct POS tags per sentence
  if (processedText.sentenceCount === 0) return 0;
  
  let totalPOSTypes = 0;
  
  for (const sentence of processedText.sentences) {
    const posInSentence = new Set<string>();
    for (const token of sentence.tokens) {
      // Skip punctuation and special symbols
      if (token.pos && !['PUNCT', 'SPACE', '.', ',', ':', ';', '!', '?', '-', '--', '(', ')', '[', ']', '{', '}', '"', "'", '`', '``', "''"].includes(token.pos)) {
        posInSentence.add(token.pos);
      }
    }
    totalPOSTypes += posInSentence.size;
  }
  
  return totalPOSTypes / processedText.sentenceCount;
}

function calculateLenNP(processedText: ProcessedText): number {
  // Average length of noun phrases across all sentences
  // This matches the averageLengthPerSentence in nounPhraseAnalyzer
  let totalNPLength = 0;
  let totalNPCount = 0;
  
  for (const sentence of processedText.sentences) {
    const nounPhrases = extractNounPhrases(sentence);
    
    for (const np of nounPhrases) {
      totalNPLength += np.length;
      totalNPCount++;
    }
  }
  
  return totalNPCount > 0 ? totalNPLength / totalNPCount : 0;
}

function calculateMetrics(text: string, processedText: ProcessedText): VocabularyMetrics {
  return {
    avrDiff: calculateAvrDiff(processedText.tokens),
    bperA: calculateBperA(processedText.tokens),
    cvv1: calculateCVV1(processedText.tokens),
    avrFreqRank: calculateAvrFreqRank(processedText.tokens),
    ari: calculateARI(text),
    vperSent: calculateVperSent(processedText),
    posTypes: calculatePOStypes(processedText),
    lenNP: calculateLenNP(processedText)
  };
}

// Regression equations from the paper
function calculateMetricScores(metrics: VocabularyMetrics): { [metric: string]: number } {
  return {
    cvv1: Math.max(0, Math.min(metrics.cvv1 * 1.1059 - 1.208, 7)),
    bperA: Math.max(0, Math.min(metrics.bperA * 13.146 + 0.428, 7)),
    posTypes: Math.max(0, Math.min(metrics.posTypes * 1.768 - 12.006, 7)),
    ari: Math.max(0, Math.min(metrics.ari * 0.607 - 1.632, 7)),
    avrDiff: Math.max(0, Math.min(metrics.avrDiff * 6.417 - 7.184, 7)),
    avrFreqRank: Math.max(0, Math.min(metrics.avrFreqRank * 0.004 - 0.608, 7)),
    vperSent: Math.max(0, Math.min(metrics.vperSent * 2.203 - 2.486, 7)),
    lenNP: Math.max(0, Math.min(metrics.lenNP * 2.629 - 6.697, 7))
  };
}

function calculateFinalScore(metricScores: { [metric: string]: number }): number {
  // Convert to array and sort
  const scores = Object.values(metricScores).sort((a, b) => a - b);
  
  // Exclude min and max values
  if (scores.length > 2) {
    scores.shift(); // Remove minimum
    scores.pop();   // Remove maximum
  }
  
  // Calculate average of remaining values
  const sum = scores.reduce((acc, score) => acc + score, 0);
  return scores.length > 0 ? sum / scores.length : 0;
}

function scoreToLevel(score: number): string {
  // Mapping from Table 2
  if (score < 0.5) return 'preA1';
  if (score < 0.84) return 'A1.1';
  if (score < 1.17) return 'A1.2';
  if (score < 1.5) return 'A1.3';
  if (score < 2) return 'A2.1';
  if (score < 2.5) return 'A2.2';
  if (score < 3) return 'B1.1';
  if (score < 3.5) return 'B1.2';
  if (score < 4) return 'B2.1';
  if (score < 4.5) return 'B2.2';
  if (score < 5.5) return 'C1';
  return 'C2';
}

function createColoredText(text: string, processedText: ProcessedText): ColoredWord[] {
  const coloredWords: ColoredWord[] = [];
  
  // Split text preserving whitespace and punctuation
  const parts = text.split(/(\s+|[.,!?;:'"-])/);
  
  // Create a map of tokens by their lowercase form for matching
  const tokenMap = new Map<string, Token>();
  for (const token of processedText.tokens) {
    tokenMap.set(token.word, token);
  }
  
  for (const part of parts) {
    if (part.match(/^\s*$/) || part.match(/^[.,!?;:'"-]$/)) {
      // Whitespace or punctuation
      coloredWords.push({
        word: part,
        level: 'NA',
        color: 'black',
        bold: false
      });
    } else if (part.length > 0) {
      // Look up the token for this word
      const token = tokenMap.get(part.toLowerCase());
      if (token) {
        const level = getWordLevel(token.lemma);
        // Check for content words using Penn Treebank tags
        const isContentWord = token.pos?.startsWith('NN') || token.pos?.startsWith('VB') || 
                             token.pos?.startsWith('JJ') || token.pos?.startsWith('RB');
        const { color, bold } = getWordColor(level, isContentWord);
        
        coloredWords.push({
          word: part, // Preserve original case
          level,
          color,
          bold
        });
      } else {
        // Fallback for words not found in token map
        coloredWords.push({
          word: part,
          level: 'NA',
          color: 'black',
          bold: false
        });
      }
    }
  }
  
  return coloredWords;
}

function calculateWordDistribution(tokens: Token[]): { [level: string]: number } {
  const distribution: { [level: string]: number } = {
    'A1': 0, 'A2': 0, 'B1': 0, 'B2': 0, 'C1': 0, 'C2': 0, 'NA': 0
  };
  
  let totalContentWords = 0;
  
  for (const token of tokens) {
    // Check for content words using Penn Treebank tags
    if (token.pos?.startsWith('NN') || token.pos?.startsWith('VB') || 
        token.pos?.startsWith('JJ') || token.pos?.startsWith('RB')) {
      const level = getWordLevel(token.lemma);
      distribution[level] = (distribution[level] || 0) + 1;
      totalContentWords++;
    }
  }
  
  // Convert to percentages
  if (totalContentWords > 0) {
    for (const level in distribution) {
      distribution[level] = (distribution[level] / totalContentWords) * 100;
    }
  }
  
  return distribution;
}

function calculateVerbStatistics(tokens: Token[]): { uniqueVerbs: number, totalVerbs: number } {
  const verbTypes = new Set<string>();
  let verbTokens = 0;
  
  for (const token of tokens) {
    if (token.pos?.startsWith('VB') && token.lemma.toLowerCase() !== 'be') {
      verbTypes.add(token.lemma.toLowerCase());
      verbTokens++;
    }
  }
  
  return { uniqueVerbs: verbTypes.size, totalVerbs: verbTokens };
}

function calculateLevelStatistics(tokens: Token[]): { stats: { [level: string]: LevelStatistics }, total: number } {
  const levelStats: { [level: string]: LevelStatistics } = {
    'A1': { count: 0, avrIdx: 0, verb: 0, noun: 0, adjective: 0 },
    'A2': { count: 0, avrIdx: 0, verb: 0, noun: 0, adjective: 0 },
    'B1': { count: 0, avrIdx: 0, verb: 0, noun: 0, adjective: 0 },
    'B2': { count: 0, avrIdx: 0, verb: 0, noun: 0, adjective: 0 },
    'C1': { count: 0, avrIdx: 0, verb: 0, noun: 0, adjective: 0 },
    'C2': { count: 0, avrIdx: 0, verb: 0, noun: 0, adjective: 0 }
  };
  
  const levelValues: { [key: string]: number } = {
    'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6
  };
  
  let totalContentWords = 0;
  
  // Count words by level and POS
  for (const token of tokens) {
    // Check for content words using Penn Treebank tags
    if (token.pos?.startsWith('NN') || token.pos?.startsWith('VB') || 
        token.pos?.startsWith('JJ') || token.pos?.startsWith('RB')) {
      const level = getWordLevel(token.lemma);
      if (level !== 'NA' && levelStats[level]) {
        levelStats[level].count++;
        
        // Count by POS
        if (token.pos?.startsWith('VB')) {
          levelStats[level].verb++;
        } else if (token.pos?.startsWith('NN')) {
          levelStats[level].noun++;
        } else if (token.pos?.startsWith('JJ')) {
          levelStats[level].adjective++;
        }
        
        totalContentWords++;
      }
    }
  }
  
  // Calculate avrIdx for each level
  for (const level in levelStats) {
    if (levelStats[level].count > 0) {
      levelStats[level].avrIdx = levelStats[level].count * levelValues[level];
    }
  }
  
  return { stats: levelStats, total: totalContentWords };
}

export function analyzeVocabularyLevel(text: string, processedText: ProcessedText): VocabularyLevel {
  const metrics = calculateMetrics(text, processedText);
  const metricScores = calculateMetricScores(metrics);
  const finalScore = calculateFinalScore(metricScores);
  const level = scoreToLevel(finalScore);
  const { stats, total } = calculateLevelStatistics(processedText.tokens);
  const { uniqueVerbs, totalVerbs } = calculateVerbStatistics(processedText.tokens);
  
  return {
    level,
    score: finalScore,
    metrics,
    metricScores,
    wordDistribution: calculateWordDistribution(processedText.tokens),
    coloredText: createColoredText(text, processedText),
    levelStatistics: stats,
    totalContentWords: total,
    uniqueVerbs,
    totalVerbs,
    sentenceCount: processedText.sentenceCount
  };
}