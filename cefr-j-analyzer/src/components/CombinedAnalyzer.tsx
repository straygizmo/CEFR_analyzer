import React, { useState } from 'react';
import { processText } from '../services/textProcessor';
import { analyzeVocabularyLevel } from '../services/levelCalculator';
import { analyzeWriting } from '../services/writingAnalyzer';

const SAMPLE_TEXT = `The internet has become an essential part of modern life, transforming how we communicate, learn, and work. Social media platforms allow people to connect across vast distances, sharing experiences and maintaining relationships that would otherwise fade. However, this digital revolution brings challenges. Privacy concerns grow as companies collect personal data, while misinformation spreads rapidly through networks. Despite these issues, the benefits are substantial. Online education democratizes learning, giving students worldwide access to quality resources. Remote work opportunities increase flexibility and reduce commuting time. As we navigate this digital age, finding balance becomes crucial - embracing technology's advantages while remaining mindful of its limitations.`;

export function CombinedAnalyzer() {
  const [text, setText] = useState('');
  const [results, setResults] = useState<{
    vocabulary: any;
    writing: any;
    combinedLevel: string;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;

  const analyzeText = async () => {
    if (wordCount < 10 || wordCount > 500) {
      setError('Please enter between 10 and 500 words for combined analysis.');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Run both analyses
      const processedText = processText(text);
      const vocabResults = analyzeVocabularyLevel(text, processedText);
      const writingResults = await analyzeWriting(text, 'assess');
      
      // Determine combined level (average of both)
      const vocabLevelNum = parseFloat(vocabResults.level.replace(/[A-C]/, match => {
        const map: { [key: string]: string } = { 'A': '1', 'B': '2', 'C': '3' };
        return map[match] || '2';
      }));
      
      const writingLevelNum = parseFloat(writingResults.level.replace(/[A-C]/, match => {
        const map: { [key: string]: string } = { 'A': '1', 'B': '2', 'C': '3' };
        return map[match] || '2';
      }));
      
      const avgLevel = (vocabLevelNum + writingLevelNum) / 2;
      let combinedLevel = 'B1.1';
      
      if (avgLevel < 1.3) combinedLevel = 'A1.1';
      else if (avgLevel < 1.7) combinedLevel = 'A2.1';
      else if (avgLevel < 2.3) combinedLevel = 'B1.1';
      else if (avgLevel < 2.7) combinedLevel = 'B2.1';
      else combinedLevel = 'C1';
      
      setResults({
        vocabulary: vocabResults,
        writing: writingResults,
        combinedLevel
      });
    } catch (err) {
      setError('An error occurred during analysis. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadSampleText = () => {
    setText(SAMPLE_TEXT);
    setResults(null);
    setError('');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-purple-600">
        Combined CEFR-J Level Analysis
      </h2>

      {!results ? (
        <div className="space-y-4">
          <div className="bg-purple-50 p-4 rounded">
            <p className="text-sm">
              Get a comprehensive assessment of your English text by combining vocabulary complexity analysis 
              with writing quality evaluation. This provides a holistic view of the text's CEFR-J level.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Enter text (10-500 words):
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your text here..."
            />
            <div className="mt-2 text-sm text-gray-600">
              Word count: {wordCount}
              {wordCount < 10 && wordCount > 0 && (
                <span className="text-red-500 ml-2">Minimum 10 words required</span>
              )}
              {wordCount > 500 && (
                <span className="text-red-500 ml-2">Maximum 500 words allowed</span>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={loadSampleText}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
            >
              Sample Text
            </button>
            <button
              onClick={() => { setText(''); setError(''); }}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
              disabled={!text}
            >
              Clear
            </button>
            <button
              onClick={analyzeText}
              className="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded transition-colors disabled:bg-gray-400"
              disabled={wordCount < 10 || wordCount > 500 || isAnalyzing}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Text'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Combined Result Summary */}
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-6 rounded-lg">
            <h3 className="text-2xl font-bold mb-4">Combined Analysis Results</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded shadow">
                <h4 className="font-semibold text-blue-600">Vocabulary Level</h4>
                <p className="text-2xl font-bold">{results.vocabulary.level}</p>
              </div>
              <div className="bg-white p-4 rounded shadow">
                <h4 className="font-semibold text-green-600">Writing Level</h4>
                <p className="text-2xl font-bold">{results.writing.level}</p>
              </div>
              <div className="bg-white p-4 rounded shadow">
                <h4 className="font-semibold text-purple-600">Combined Level</h4>
                <p className="text-2xl font-bold">{results.combinedLevel}</p>
              </div>
            </div>
          </div>

          {/* Vocabulary Analysis Section */}
          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-600">Vocabulary Analysis</h3>
            
            <div className="p-4 bg-gray-50 border rounded-lg mb-4">
              {results.vocabulary.coloredText.map((word: any, index: number) => (
                <span
                  key={index}
                  style={{ color: word.color }}
                  className={word.bold ? 'font-bold' : ''}
                >
                  {word.word}
                </span>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Key Metrics:</h4>
                <ul className="space-y-1 text-sm">
                  <li>Average Difficulty: {results.vocabulary.metrics.avrDiff.toFixed(2)}</li>
                  <li>B/A Ratio: {results.vocabulary.metrics.bperA.toFixed(2)}</li>
                  <li>Vocabulary Diversity: {results.vocabulary.metrics.cvv1.toFixed(2)}</li>
                  <li>Readability (ARI): {results.vocabulary.metrics.ari.toFixed(2)}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Word Distribution:</h4>
                <div className="space-y-1 text-sm">
                  {Object.entries(results.vocabulary.wordDistribution).map(([level, count]) => (
                    <div key={level} className="flex justify-between">
                      <span>{level}:</span>
                      <span>{count as number} words</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Writing Analysis Section */}
          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold mb-4 text-green-600">Writing Analysis</h3>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-semibold mb-2">Writing Quality Scores:</h4>
                <ul className="space-y-1 text-sm">
                  <li>Complexity: {results.writing.metrics.complexity}/7</li>
                  <li>Accuracy: {results.writing.metrics.accuracy}/7</li>
                  <li>Fluency: {results.writing.metrics.fluency}/7</li>
                  <li>Logicality: {results.writing.metrics.logicality}/7</li>
                  <li>Sophistication: {results.writing.metrics.sophistication}/7</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Overall Assessment:</h4>
                <p className="text-sm mb-2">Total Score: {results.writing.totalScore.toFixed(1)}/100</p>
                <p className="text-sm">{results.writing.feedback}</p>
              </div>
            </div>

            {results.writing.corrections.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Suggested Corrections:</h4>
                <div className="space-y-2">
                  {results.writing.corrections.slice(0, 3).map((correction: any, idx: number) => (
                    <div key={idx} className="bg-yellow-50 p-3 rounded text-sm">
                      <p className="text-gray-600">{correction.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recommendations */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Recommendations</h3>
            <p className="text-sm mb-2">
              Based on your combined level of <strong>{results.combinedLevel}</strong>, here are some suggestions:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {results.vocabulary.metrics.avrDiff < 1.5 && (
                <li>Try incorporating more B1/B2 level vocabulary to enhance text complexity</li>
              )}
              {results.writing.metrics.accuracy < 6 && (
                <li>Focus on grammar accuracy and spelling to improve clarity</li>
              )}
              {results.writing.metrics.fluency < 6 && (
                <li>Work on sentence variety and transitions for better flow</li>
              )}
              <li>Continue practicing with texts at the {results.combinedLevel} level and above</li>
            </ul>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => setResults(null)}
              className="px-6 py-2 bg-gray-500 text-white hover:bg-gray-600 rounded transition-colors"
            >
              Analyze Another Text
            </button>
          </div>
        </div>
      )}
    </div>
  );
}