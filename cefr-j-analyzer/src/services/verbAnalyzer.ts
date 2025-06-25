import type { ProcessedText } from './textProcessor';

export interface VerbAnalysis {
  sentenceNumber: number;
  sentenceText: string;
  verbs: string[];
  verbCount: number;
}

export interface VerbAnalysisResult {
  sentences: VerbAnalysis[];
  totalVerbs: number;
  totalSentences: number;
  averageVerbsPerSentence: number;
}

export function analyzeVerbsPerSentence(processedText: ProcessedText): VerbAnalysisResult {
  const sentences: VerbAnalysis[] = [];
  let totalVerbs = 0;

  processedText.sentences.forEach((sentence, index) => {
    const verbs: string[] = [];
    
    // Count both VERB and AUX tags as verbs
    sentence.tokens.forEach(token => {
      if (token.pos === 'VERB' || token.pos === 'AUX') {
        verbs.push(`${token.word} (${token.lemma})`);
      }
    });

    const sentenceText = sentence.tokens
      .map(token => token.word)
      .join(' ')
      .replace(/\s+([.,!?;:])/g, '$1');

    sentences.push({
      sentenceNumber: index + 1,
      sentenceText,
      verbs,
      verbCount: verbs.length
    });

    totalVerbs += verbs.length;
  });

  const averageVerbsPerSentence = processedText.sentenceCount > 0 
    ? totalVerbs / processedText.sentenceCount 
    : 0;

  return {
    sentences,
    totalVerbs,
    totalSentences: processedText.sentenceCount,
    averageVerbsPerSentence
  };
}