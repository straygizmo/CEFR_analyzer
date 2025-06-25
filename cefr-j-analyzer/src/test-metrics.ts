import { processText } from './services/textProcessor';
import { analyzeVocabularyLevel } from './services/levelCalculator';

const testTexts = [
  "The cat sits on the mat and looks very happy.",
  "Technology has revolutionized how we communicate and work. Smartphones enable instant connection with people worldwide.",
  "The human brain, with its approximately 86 billion neurons and trillions of synaptic connections, represents one of the most complex structures in the known universe."
];

console.log("Testing CEFR-J Vocabulary Analyzer Metrics\n");

for (const text of testTexts) {
  console.log(`\nText: "${text.substring(0, 50)}..."`);
  console.log(`Word count: ${text.split(/\s+/).length}`);
  
  try {
    const processedText = processText(text);
    console.log(`Tokens: ${processedText.tokens.length}`);
    console.log(`Sentences: ${processedText.sentenceCount}`);
    
    const result = analyzeVocabularyLevel(text, processedText);
    
    console.log(`\nMetrics:`);
    console.log(`- AvrDiff: ${result.metrics.avrDiff.toFixed(2)}`);
    console.log(`- BperA: ${result.metrics.bperA.toFixed(2)}`);
    console.log(`- CVV1: ${result.metrics.cvv1.toFixed(2)}`);
    console.log(`- AvrFreqRank: ${result.metrics.avrFreqRank.toFixed(2)}`);
    console.log(`- ARI: ${result.metrics.ari.toFixed(2)}`);
    console.log(`- VperSent: ${result.metrics.vperSent.toFixed(2)}`);
    console.log(`- POStypes: ${result.metrics.posTypes.toFixed(2)}`);
    console.log(`- LenNP: ${result.metrics.lenNP.toFixed(2)}`);
    
    console.log(`\nEstimated Level: ${result.level}`);
    console.log(`Final Score: ${result.score.toFixed(2)}`);
    
  } catch (error) {
    console.error(`Error:`, error);
  }
  
  console.log("\n" + "=".repeat(50));
}