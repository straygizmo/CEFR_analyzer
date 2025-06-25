const fs = require('fs');

// Read and convert vocabulary index
const vocabData = JSON.parse(fs.readFileSync('./src/data/vocabulary-index.json', 'utf8'));
const vocabLines = ['// CEFR-J Vocabulary Index', '// Generated from vocabulary-index.json', '', 'export const vocabularyIndex: { [key: string]: string[] } = {'];

for (const [word, levels] of Object.entries(vocabData)) {
  vocabLines.push(`  "${word}": ${JSON.stringify(levels)},`);
}

// Remove last comma
vocabLines[vocabLines.length - 1] = vocabLines[vocabLines.length - 1].slice(0, -1);
vocabLines.push('};');
vocabLines.push('');
vocabLines.push('// Add a function to get word level with proper handling');
vocabLines.push('export function getWordLevel(word: string): string {');
vocabLines.push('  const levels = vocabularyIndex[word.toLowerCase()];');
vocabLines.push('  if (!levels || levels.length === 0) return \'NA\';');
vocabLines.push('  ');
vocabLines.push('  // Return the lowest level (e.g., if word appears in both A1 and A2, return A1)');
vocabLines.push('  const levelOrder = [\'A1\', \'A2\', \'B1\', \'B2\', \'C1\', \'C2\'];');
vocabLines.push('  for (const level of levelOrder) {');
vocabLines.push('    if (levels.includes(level)) return level;');
vocabLines.push('  }');
vocabLines.push('  return levels[0];');
vocabLines.push('}');

fs.writeFileSync('./src/data/vocabulary-index.ts', vocabLines.join('\n'));

// Read and convert COCA frequency data
const cocaData = JSON.parse(fs.readFileSync('./src/data/coca-frequency.json', 'utf8'));
const cocaLines = ['// COCA Word Frequency Data', '// Generated from coca-frequency.json', '', 'export const cocaFrequency: { [key: string]: number } = {'];

for (const [word, freq] of Object.entries(cocaData)) {
  cocaLines.push(`  "${word}": ${freq},`);
}

// Remove last comma
cocaLines[cocaLines.length - 1] = cocaLines[cocaLines.length - 1].slice(0, -1);
cocaLines.push('};');
cocaLines.push('');
cocaLines.push('// Add a function to get word frequency');
cocaLines.push('export function getWordFrequency(word: string): number {');
cocaLines.push('  return cocaFrequency[word.toLowerCase()] || 1000; // Default to 1000 if not found');
cocaLines.push('}');

fs.writeFileSync('./src/data/coca-frequency.ts', cocaLines.join('\n'));

console.log('Conversion complete!');
console.log(`Vocabulary index: ${Object.keys(vocabData).length} words`);
console.log(`COCA frequency: ${Object.keys(cocaData).length} words`);