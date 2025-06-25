// Test script to verify the updated vocabulary statistics functionality
import { processText } from "./src/services/textProcessor.js";
import { analyzeVocabularyLevel } from "./src/services/levelCalculator.js";

const testText = `Writing is the act of recording language on a visual medium using a set of symbols. The symbols must be known to others, so that the text may be read. A text may also use other visual systems, such as illustrations and decorations.`;

const processedText = processText(testText);
const results = analyzeVocabularyLevel(testText, processedText);

console.log("=== Updated CVLA Results ===\n");

// Display word count
console.log(
  `Words count: ${
    testText
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length
  }\n`
);

// Display vocabulary statistics table
console.log("Vocabulary Statistics by CEFR Level:");
console.log("=====================================");
console.log("CEFR | Count | AvrIdx | verb | noun | adjective");
console.log("-----|-------|--------|------|------|----------");

const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
let totalCount = 0;
let totalAvrIdx = 0;
let totalVerb = 0;
let totalNoun = 0;
let totalAdjective = 0;

levels.forEach((level) => {
  const stats = results.levelStatistics[level];
  console.log(
    `${level.padEnd(4)} | ${stats.count.toString().padStart(5)} | ${stats.avrIdx
      .toString()
      .padStart(6)} | ${stats.verb.toString().padStart(4)} | ${stats.noun
      .toString()
      .padStart(4)} | ${stats.adjective.toString().padStart(9)}`
  );

  totalCount += stats.count;
  totalAvrIdx += stats.avrIdx;
  totalVerb += stats.verb;
  totalNoun += stats.noun;
  totalAdjective += stats.adjective;
});

console.log("-----|-------|--------|------|------|----------");
console.log(
  `SUM  | ${totalCount.toString().padStart(5)} | ${totalAvrIdx
    .toString()
    .padStart(6)} | ${totalVerb.toString().padStart(4)} | ${totalNoun
    .toString()
    .padStart(4)} | ${totalAdjective.toString().padStart(9)}`
);

console.log("\nMetric Calculation Details:");
console.log("===========================");
console.log(`Total CEFR Words: ${results.totalContentWords}`);
console.log(`Sentences: ${results.sentenceCount}`);
console.log(`Total Verbs: ${results.totalVerbs}`);
console.log(`Unique Verbs (excluding 'be'): ${results.uniqueVerbs}`);
console.log(`Total Nouns: ${totalNoun}`);
console.log(`Total Adjectives: ${totalAdjective}`);
console.log(
  `\nA-level Words (A1+A2): ${
    results.levelStatistics.A1.count + results.levelStatistics.A2.count
  }`
);
console.log(
  `B-level Words (B1+B2): ${
    results.levelStatistics.B1.count + results.levelStatistics.B2.count
  }`
);
console.log(
  `C-level Words (C1+C2): ${
    results.levelStatistics.C1.count + results.levelStatistics.C2.count
  }`
);

console.log("\nMetric Calculations:");
console.log("====================");
console.log(
  `AvrDiff = Σ(level × count) / total = ${totalAvrIdx} / ${
    results.totalContentWords
  } = ${results.metrics.avrDiff.toFixed(2)}`
);
console.log(
  `BperA = B-level / A-level = ${
    results.levelStatistics.B1.count + results.levelStatistics.B2.count
  } / ${
    results.levelStatistics.A1.count + results.levelStatistics.A2.count
  } = ${results.metrics.bperA.toFixed(2)}`
);
console.log(
  `CVV1 = unique verbs / √(2 × total verbs) = ${results.uniqueVerbs} / √(2 × ${
    results.totalVerbs
  }) = ${results.metrics.cvv1.toFixed(2)}`
);
console.log(
  `VperSent = total verbs / sentences = ${results.totalVerbs} / ${
    results.sentenceCount
  } = ${results.metrics.vperSent.toFixed(2)}`
);
