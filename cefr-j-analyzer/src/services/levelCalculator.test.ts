// Test the level calculator to debug the issue
import { analyzeVocabularyLevel } from './levelCalculator';
import { processText } from './textProcessor';

// Test with different texts
const testCases = [
  {
    name: "Simple A1 text",
    text: "I have a cat. The cat is black. I like my cat."
  },
  {
    name: "A2 text",
    text: "Yesterday I went to the store. I bought some milk and bread. The weather was nice so I walked home."
  },
  {
    name: "B1 text",
    text: "Although the weather forecast predicted rain, I decided to go hiking in the mountains. The scenery was breathtaking."
  }
];

console.log("Testing Level Calculator\n");

testCases.forEach(testCase => {
  console.log(`\nTest: ${testCase.name}`);
  console.log(`Text: "${testCase.text.substring(0, 50)}..."`);
  
  const processedText = processText(testCase.text);
  console.log(`Processed tokens: ${processedText.tokens.length}`);
  
  // Get a few sample tokens
  console.log('Sample tokens:', processedText.tokens.slice(0, 3).map(t => ({
    word: t.word,
    pos: t.pos,
    lemma: t.lemma
  })));
  
  const results = analyzeVocabularyLevel(testCase.text, processedText);
  
  console.log('Results:');
  console.log('  Level:', results.level);
  console.log('  Metrics:', results.metrics);
  console.log('  Metric Scores:', results.metricScores);
  console.log('  Final Score:', results.score);
});