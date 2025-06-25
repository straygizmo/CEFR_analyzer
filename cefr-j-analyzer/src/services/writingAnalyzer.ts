import { processText } from './textProcessor';
import { analyzeVocabularyLevel } from './levelCalculator';

export interface WritingCorrection {
  original: string;
  corrected: string;
  comment: string;
}

export interface WritingAnalysisResult {
  level: string;
  totalScore: number;
  metrics: {
    avrDiff: number;
    bperA: number;
    complexity: number;
    accuracy: number;
    fluency: number;
    logicality: number;
    sophistication: number;
  };
  corrections: WritingCorrection[];
  feedback: string;
  coloredText: Array<{ word: string; color: string; bold: boolean; italic?: boolean }>;
}

// Simulate AI analysis for complexity, accuracy, fluency, logicality, sophistication
// In production, these would come from Gemini API
function analyzeWritingQuality(text: string): {
  complexity: number;
  accuracy: number;
  fluency: number;
  logicality: number;
  sophistication: number;
} {
  // Simple heuristics for demo
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLength = text.split(/\s+/).length / sentences.length;
  
  // Simulate scores based on simple metrics
  const complexity = Math.min(7, Math.max(3, avgSentenceLength / 5));
  const accuracy = Math.random() * 2 + 5; // 5-7 range
  const fluency = Math.random() * 2 + 5;
  const logicality = Math.random() * 2 + 5;
  const sophistication = Math.random() * 2 + 4; // 4-6 range
  
  return {
    complexity: Math.round(complexity),
    accuracy: Math.round(accuracy),
    fluency: Math.round(fluency),
    logicality: Math.round(logicality),
    sophistication: Math.round(sophistication)
  };
}

// Simulate correction detection
function detectCorrections(text: string): WritingCorrection[] {
  const corrections: WritingCorrection[] = [];
  
  // Common spelling mistakes simulation
  const spellingMistakes: { [key: string]: string } = {
    'comunication': 'communication',
    'decrese': 'decrease',
    'recieve': 'receive',
    'occured': 'occurred'
  };
  
  const sentences = text.split(/(?<=[.!?])\s+/);
  
  sentences.forEach(sentence => {
    // Check for spelling mistakes
    Object.entries(spellingMistakes).forEach(([wrong, correct]) => {
      if (sentence.toLowerCase().includes(wrong)) {
        corrections.push({
          original: sentence,
          corrected: sentence.replace(new RegExp(wrong, 'gi'), correct),
          comment: `There was a spelling mistake in '${wrong}'; it should be '${correct}'.`
        });
      }
    });
    
    // Check for common grammar issues
    if (sentence.includes('get bad from')) {
      corrections.push({
        original: sentence,
        corrected: sentence.replace('get bad from', 'can be harmful when'),
        comment: "The phrase 'get bad' is not natural; 'can be harmful' is clearer."
      });
    }
    
    if (sentence.includes('spend a lot on Internet')) {
      corrections.push({
        original: sentence,
        corrected: sentence.replace('spend a lot on Internet', 'spend a lot of time on the Internet'),
        comment: "The phrase should be 'spend a lot of time on the Internet'."
      });
    }
  });
  
  return corrections;
}

// Generate feedback based on analysis
function generateFeedback(
  level: string,
  metrics: WritingAnalysisResult['metrics'],
  corrections: WritingCorrection[]
): string {
  const hasSpellingErrors = corrections.some(c => c.comment.includes('spelling'));
  const hasGrammarErrors = corrections.some(c => !c.comment.includes('spelling'));
  
  let feedback = 'You did a great job expressing your opinion on an important topic! ';
  feedback += 'Your ideas are clear, and you provided good reasons for your argument. ';
  
  if (hasSpellingErrors || hasGrammarErrors) {
    feedback += 'Pay attention to spelling and grammar, as these can improve the clarity of your writing. ';
  }
  
  if (metrics.sophistication < 5) {
    feedback += 'Try using more varied vocabulary to enhance your writing. ';
  }
  
  feedback += 'Keep practicing, and you\'ll continue to improve!';
  
  return feedback;
}

// Create colored text with spelling error highlighting
function createColoredTextWithErrors(
  text: string,
  vocabColoredText: Array<{ word: string; color: string; bold: boolean }>,
  corrections: WritingCorrection[]
): Array<{ word: string; color: string; bold: boolean; italic?: boolean }> {
  const result = [...vocabColoredText];
  
  // Mark spelling errors in red italic
  const spellingErrors = new Set<string>();
  corrections.forEach(c => {
    const match = c.comment.match(/spelling mistake in '(\w+)'/);
    if (match) {
      spellingErrors.add(match[1]);
    }
  });
  
  return result.map(item => {
    if (spellingErrors.has(item.word.toLowerCase())) {
      return { ...item, color: 'red', italic: true };
    }
    return item;
  });
}

export async function analyzeWriting(
  text: string,
  mode: 'check' | 'assess' = 'assess'
): Promise<WritingAnalysisResult> {
  // Process text for vocabulary analysis
  const processedText = processText(text);
  const vocabAnalysis = analyzeVocabularyLevel(text, processedText);
  
  // Get writing quality metrics
  const qualityMetrics = analyzeWritingQuality(text);
  
  // Detect corrections
  const corrections = detectCorrections(text);
  
  // Calculate metrics
  const metrics = {
    avrDiff: vocabAnalysis.metrics.avrDiff,
    bperA: vocabAnalysis.metrics.bperA,
    ...qualityMetrics
  };
  
  // Calculate total score
  const totalScore = ((metrics.avrDiff + metrics.bperA) / 2 + 
    metrics.complexity + metrics.accuracy + metrics.fluency + 
    metrics.logicality + metrics.sophistication) / 6 * 100;
  
  // Determine level based on total score
  let level = 'B1.1';
  if (totalScore < 30) level = 'A1.1';
  else if (totalScore < 40) level = 'A2.1';
  else if (totalScore < 50) level = 'A2.2';
  else if (totalScore < 60) level = 'B1.1';
  else if (totalScore < 70) level = 'B1.2';
  else if (totalScore < 80) level = 'B2.1';
  else level = 'B2.2';
  
  // Generate feedback
  const feedback = generateFeedback(level, metrics, corrections);
  
  // Create colored text with error highlighting
  const coloredText = createColoredTextWithErrors(text, vocabAnalysis.coloredText, corrections);
  
  return {
    level,
    totalScore,
    metrics,
    corrections: mode === 'assess' ? corrections : [],
    feedback,
    coloredText
  };
}

// Call Gemini API (placeholder - implement with actual API)
export async function callGeminiAPI(text: string, apiKey: string): Promise<any> {
  // This would be the actual Gemini API call
  // For now, return mock data
  const mockResponse = {
    corrections: detectCorrections(text),
    feedback: 'AI-generated feedback would appear here',
    metrics: analyzeWritingQuality(text)
  };
  
  return mockResponse;
}