import { processText } from '../../src/services/textProcessor';
import { analyzeVocabularyLevel } from '../../src/services/levelCalculator';
import { analyzeWriting } from '../../src/services/writingAnalyzer';

export async function onRequestPost(context: {
  request: Request;
  env: { GEMINI_API_KEY?: string };
}) {
  try {
    const { text, mode = 'vocabulary' } = await context.request.json();

    if (!text || typeof text !== 'string') {
      return new Response(JSON.stringify({ error: 'Text is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;

    if (wordCount < 10) {
      return new Response(JSON.stringify({ error: 'Minimum 10 words required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (mode === 'vocabulary' && wordCount > 1000) {
      return new Response(JSON.stringify({ error: 'Maximum 1000 words for vocabulary analysis' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (mode === 'writing' && wordCount > 500) {
      return new Response(JSON.stringify({ error: 'Maximum 500 words for writing analysis' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let result;

    switch (mode) {
      case 'vocabulary': {
        const processedText = processText(text);
        result = analyzeVocabularyLevel(text, processedText);
        break;
      }
      case 'writing': {
        result = await analyzeWriting(text, 'assess');
        break;
      }
      case 'combined': {
        const processedText = processText(text);
        const vocabResults = analyzeVocabularyLevel(text, processedText);
        const writingResults = await analyzeWriting(text, 'assess');
        result = {
          vocabulary: vocabResults,
          writing: writingResults,
          combinedLevel: determineCombinedLevel(vocabResults.level, writingResults.level)
        };
        break;
      }
      default:
        return new Response(JSON.stringify({ error: 'Invalid mode' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return new Response(JSON.stringify({ error: 'Analysis failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

function determineCombinedLevel(vocabLevel: string, writingLevel: string): string {
  const levelMap: { [key: string]: number } = {
    'A1.1': 1.1, 'A1.2': 1.2, 'A1.3': 1.3,
    'A2.1': 2.1, 'A2.2': 2.2,
    'B1.1': 3.1, 'B1.2': 3.2,
    'B2.1': 4.1, 'B2.2': 4.2,
    'C1': 5, 'C2': 6
  };

  const vocabNum = levelMap[vocabLevel] || 3.1;
  const writingNum = levelMap[writingLevel] || 3.1;
  const avgNum = (vocabNum + writingNum) / 2;

  if (avgNum < 1.5) return 'A1.1';
  if (avgNum < 2) return 'A1.3';
  if (avgNum < 2.5) return 'A2.1';
  if (avgNum < 3) return 'A2.2';
  if (avgNum < 3.5) return 'B1.1';
  if (avgNum < 4) return 'B1.2';
  if (avgNum < 4.5) return 'B2.1';
  if (avgNum < 5) return 'B2.2';
  return 'C1';
}