import { describe, it, expect } from 'vitest';
import { processText } from '../src/services/textProcessor';
import { analyzeNounPhrasesPerSentence } from '../src/services/nounPhraseAnalyzer';

describe('Noun Phrase Analyzer', () => {
  it('should analyze noun phrases correctly for simple sentences', () => {
    const text = "The cat sat on the mat. A big dog chased the small cat.";
    const processedText = processText(text);
    const result = analyzeNounPhrasesPerSentence(processedText);

    expect(result.totalSentences).toBe(2);
    expect(result.totalNounPhrases).toBeGreaterThan(0);
    
    // First sentence should have noun phrases like "the cat", "the mat"
    const firstSentence = result.sentences[0];
    expect(firstSentence.nounPhraseCount).toBeGreaterThan(0);
    expect(firstSentence.nounPhrases).toContain('the cat');
    expect(firstSentence.nounPhrases).toContain('the mat');
    
    // Second sentence should have "a big dog", "the small cat"
    const secondSentence = result.sentences[1];
    expect(secondSentence.nounPhraseCount).toBeGreaterThan(0);
    expect(secondSentence.nounPhrases.some(np => np.includes('dog'))).toBe(true);
    expect(secondSentence.nounPhrases.some(np => np.includes('cat'))).toBe(true);
  });

  it('should calculate average length correctly', () => {
    const text = "The quick brown fox jumps over the lazy dog.";
    const processedText = processText(text);
    const result = analyzeNounPhrasesPerSentence(processedText);

    expect(result.averageLengthPerSentence).toBeGreaterThan(1); // Should be more than single words
    expect(result.sentences[0].averageLength).toBeGreaterThan(0);
  });

  it('should handle complex noun phrases with prepositional phrases', () => {
    const text = "The book on the table belongs to the student in the library.";
    const processedText = processText(text);
    const result = analyzeNounPhrasesPerSentence(processedText);

    // Should find complex noun phrases
    const nounPhrases = result.sentences[0].nounPhrases;
    expect(nounPhrases.some(np => np.includes('book') && np.includes('table'))).toBe(true);
    expect(nounPhrases.some(np => np.includes('student') && np.includes('library'))).toBe(true);
  });
});