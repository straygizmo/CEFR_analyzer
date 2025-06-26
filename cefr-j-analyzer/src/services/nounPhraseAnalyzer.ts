import type { ProcessedText } from './textProcessor';
import { extractNounPhrases } from './textProcessor';

export interface NounPhraseAnalysis {
  sentenceNumber: number;
  sentenceText: string;
  nounPhrases: string[];
  nounPhraseCount: number;
  averageLength: number;
}

export interface NounPhraseAnalysisResult {
  sentences: NounPhraseAnalysis[];
  totalNounPhrases: number;
  totalSentences: number;
  averageNounPhrasesPerSentence: number;
  averageLengthPerSentence: number;
}

export function analyzeNounPhrasesPerSentence(processedText: ProcessedText): NounPhraseAnalysisResult {
  const sentences: NounPhraseAnalysis[] = [];
  let totalNounPhrases = 0;
  let totalLengthSum = 0;

  processedText.sentences.forEach((sentence, index) => {
    const nounPhrases = extractNounPhrases(sentence);
    const nounPhraseStrings = nounPhrases.map(phrase => phrase.join(' '));
    
    // Calculate average length for this sentence
    let sentenceLengthSum = 0;
    nounPhrases.forEach(phrase => {
      sentenceLengthSum += phrase.length;
    });
    const averageLength = nounPhrases.length > 0 
      ? sentenceLengthSum / nounPhrases.length 
      : 0;

    const sentenceText = sentence.tokens
      .map(token => token.word)
      .join(' ')
      .replace(/\s+([.,!?;:])/g, '$1');

    sentences.push({
      sentenceNumber: index + 1,
      sentenceText,
      nounPhrases: nounPhraseStrings,
      nounPhraseCount: nounPhrases.length,
      averageLength
    });

    totalNounPhrases += nounPhrases.length;
    totalLengthSum += sentenceLengthSum;
  });

  const averageNounPhrasesPerSentence = processedText.sentenceCount > 0 
    ? totalNounPhrases / processedText.sentenceCount 
    : 0;

  const averageLengthPerSentence = totalNounPhrases > 0
    ? totalLengthSum / totalNounPhrases
    : 0;

  return {
    sentences,
    totalNounPhrases,
    totalSentences: processedText.sentenceCount,
    averageNounPhrasesPerSentence,
    averageLengthPerSentence
  };
}