import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetsDir = path.join(__dirname, '../../assets');
const outputDir = path.join(__dirname, '../src/data');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Function to convert CSV to JSON
function convertCSVtoJSON(csvFile, outputFile) {
  try {
    const csvData = fs.readFileSync(path.join(assetsDir, csvFile), 'utf-8');
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    
    // Create optimized structure for vocabulary lookup
    const optimizedData = {};
    
    if (csvFile.includes('Dict')) {
      // For dictionary files, create a word lookup map
      records.forEach(record => {
        const word = record.headword.toLowerCase();
        if (!optimizedData[word]) {
          optimizedData[word] = [];
        }
        optimizedData[word].push({
          pos: record.pos,
          meaning: record.meaning,
          ipa: record.ipa,
          word_id: record.word_id,
          example_sentence: record.example_sentence,
          translated_sentence: record.translated_sentence
        });
      });
    } else if (csvFile.includes('GrammarProfile')) {
      // For grammar files, keep as array but add index
      optimizedData.patterns = records.map(record => ({
        id: record.id,
        cefr_level: record.cefr_level,
        name: record.name,
        summary: record.summary,
        explanation: record.explanation,
        original: record.original,
        translation: record.translation
      }));
    }
    
    // Write JSON file
    fs.writeFileSync(
      path.join(outputDir, outputFile),
      JSON.stringify(optimizedData, null, 2)
    );
    
    console.log(`✓ Converted ${csvFile} to ${outputFile}`);
    console.log(`  Total entries: ${Object.keys(optimizedData).length || optimizedData.patterns?.length}`);
  } catch (error) {
    console.error(`✗ Error converting ${csvFile}:`, error.message);
  }
}

// Convert all CSV files
const conversions = [
  { csv: 'CEFR-J_A1_Dict.csv', json: 'vocabulary-a1.json' },
  { csv: 'CEFR-J_A2_Dict.csv', json: 'vocabulary-a2.json' },
  { csv: 'CEFR-J_B1_Dict.csv', json: 'vocabulary-b1.json' },
  { csv: 'CEFR-J_B2_Dict.csv', json: 'vocabulary-b2.json' },
  { csv: 'CEFR-J_A1_GrammarProfile.csv', json: 'grammar-a1.json' },
  { csv: 'CEFR-J_A2_GrammarProfile.csv', json: 'grammar-a2.json' },
  { csv: 'CEFR-J_B1_GrammarProfile.csv', json: 'grammar-b1.json' },
  { csv: 'CEFR-J_B2_GrammarProfile.csv', json: 'grammar-b2.json' }
];

console.log('Converting CSV files to JSON...\n');
conversions.forEach(({ csv, json }) => {
  convertCSVtoJSON(csv, json);
});

// Create a combined vocabulary index for faster lookups
console.log('\nCreating combined vocabulary index...');
const vocabularyIndex = {};
const levels = ['a1', 'a2', 'b1', 'b2'];

levels.forEach(level => {
  const data = JSON.parse(
    fs.readFileSync(path.join(outputDir, `vocabulary-${level}.json`), 'utf-8')
  );
  
  Object.keys(data).forEach(word => {
    if (!vocabularyIndex[word]) {
      vocabularyIndex[word] = [];
    }
    vocabularyIndex[word].push(level.toUpperCase());
  });
});

fs.writeFileSync(
  path.join(outputDir, 'vocabulary-index.json'),
  JSON.stringify(vocabularyIndex, null, 2)
);

console.log('✓ Created vocabulary index with', Object.keys(vocabularyIndex).length, 'unique words');
console.log('\nConversion complete!');