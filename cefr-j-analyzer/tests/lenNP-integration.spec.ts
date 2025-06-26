import { describe, it, expect } from 'vitest';
import { processText } from '../src/services/textProcessor';
import { analyzeVocabularyLevel } from '../src/services/levelCalculator';

describe('LenNP Integration Test', () => {
  it('should calculate LenNP metric correctly', () => {
    const text = "The big brown dog chased the small white cat. The book on the table belongs to the teacher.";
    const processedText = processText(text);
    const result = analyzeVocabularyLevel(text, processedText);
    const lenNP = result.metrics.lenNP;

    console.log('LenNP calculated:', lenNP);
    
    // LenNP should be greater than 2 for text with adjectives and prepositional phrases
    expect(lenNP).toBeGreaterThan(2);
    expect(lenNP).toBeLessThan(6); // Reasonable upper bound
  });

  it('should handle simple sentences', () => {
    const text = "I eat food. You like music.";
    const processedText = processText(text);
    const result = analyzeVocabularyLevel(text, processedText);
    const lenNP = result.metrics.lenNP;

    console.log('LenNP for simple text:', lenNP);
    
    // Simple noun phrases should have lower LenNP
    expect(lenNP).toBeGreaterThan(0);
    expect(lenNP).toBeLessThan(2);
  });
});