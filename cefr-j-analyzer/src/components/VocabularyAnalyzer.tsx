import React, { useState } from 'react';
import { processText } from '../services/textProcessor';
import type { VocabularyLevel, VocabularyMetrics } from '../services/levelCalculator';
import { analyzeVocabularyLevel } from '../services/levelCalculator';

const SAMPLE_TEXT = `Writing is the act of recording language on a visual medium using a set of symbols. The symbols must be known to others, so that the text may be read. A text may also use other visual systems, such as illustrations and decorations. These are not called writing, but may help the message work. Usually, all educated people in a country use the same writing system to record the same language. To be able to read and write is to be literate.`;

const REFERENCE_VALUES = {
  A1: { avrDiff: 1.28, bperA: 0.06, cvv1: 1.93, avrFreqRank: 367.99, ari: 4.10, vperSent: 1.51, posTypes: 7.16, lenNP: 2.94 },
  A2: { avrDiff: 1.44, bperA: 0.12, cvv1: 2.95, avrFreqRank: 445.92, ari: 6.22, vperSent: 2.05, posTypes: 8.14, lenNP: 3.36 },
  B1: { avrDiff: 1.57, bperA: 0.18, cvv1: 3.90, avrFreqRank: 514.55, ari: 7.82, vperSent: 2.66, posTypes: 8.73, lenNP: 3.64 },
  B2: { avrDiff: 1.74, bperA: 0.26, cvv1: 4.67, avrFreqRank: 613.05, ari: 9.19, vperSent: 2.95, posTypes: 9.04, lenNP: 3.99 },
  C1: { avrDiff: 1.91, bperA: 0.36, cvv1: 5.58, avrFreqRank: 739.30, ari: 10.79, vperSent: 3.28, posTypes: 9.36, lenNP: 4.51 }
};

export function VocabularyAnalyzer() {
  const [text, setText] = useState('');
  const [results, setResults] = useState<VocabularyLevel | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;

  const analyzeText = async () => {
    if (wordCount < 10 || wordCount > 1000) {
      setError('Please enter between 10 and 1000 words.');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const processedText = processText(text);
      const analysisResults = analyzeVocabularyLevel(text, processedText);
      setResults(analysisResults);
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

  const clearText = () => {
    setText('');
    setResults(null);
    setError('');
  };

  const getScorePercentage = (score: number) => (score / 7) * 100;

  const getMetricScore = (metric: keyof VocabularyMetrics, value: number): number => {
    const ranges = {
      avrDiff: { min: 1.0, max: 2.2 },
      bperA: { min: 0, max: 0.5 },
      cvv1: { min: 1.5, max: 6.0 },
      avrFreqRank: { min: 300, max: 800 },
      ari: { min: 3, max: 12 },
      vperSent: { min: 1, max: 4 },
      posTypes: { min: 6, max: 10 },
      lenNP: { min: 2, max: 5 }
    };
    
    const range = ranges[metric];
    const normalized = ((value - range.min) / (range.max - range.min)) * 7;
    return Math.max(0, Math.min(7, normalized));
  };

  const getSubLevel = (metric: keyof VocabularyMetrics, value: number): string => {
    let closestLevel = 'A1';
    let minDiff = Infinity;
    
    for (const [level, refs] of Object.entries(REFERENCE_VALUES)) {
      const diff = Math.abs(value - refs[metric]);
      if (diff < minDiff) {
        minDiff = diff;
        closestLevel = level;
      }
    }
    
    return closestLevel;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">
        <a href="/" className="text-blue-600 hover:underline">
          CVLA: CEFR-based Vocabulary Level Analyzer
        </a>
      </h2>

      {!results ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Enter text (10-1000 words):
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your text here..."
            />
            <div className="mt-2 text-sm text-gray-600">
              Word count: {wordCount}
              {wordCount < 10 && wordCount > 0 && (
                <span className="text-red-500 ml-2">Minimum 10 words required</span>
              )}
              {wordCount > 1000 && (
                <span className="text-red-500 ml-2">Maximum 1000 words allowed</span>
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
              onClick={clearText}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
              disabled={!text}
            >
              Clear
            </button>
            <button
              onClick={analyzeText}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded transition-colors disabled:bg-gray-400"
              disabled={wordCount < 10 || wordCount > 1000 || isAnalyzing}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <h4 className="text-xl font-semibold">Input Text</h4>
          <div className="p-4 bg-gray-50 border rounded-lg">
            {results.coloredText.map((word, index) => (
              <span
                key={index}
                style={{ color: word.color }}
                className={word.bold ? 'font-bold' : ''}
              >
                {word.word}
              </span>
            ))}
          </div>

          <div className="bg-gray-100 p-3 rounded">
            <strong>Legend:</strong><br />
            A1: <span style={{ color: '#32cd32' }}>A1 Level Word</span>,{' '}
            A2: <span style={{ color: '#32cd32', fontWeight: 'bold' }}>A2 Level Word</span>,{' '}
            B1: <span style={{ color: 'blue' }}>B1 Level Word</span>,{' '}
            B2: <span style={{ color: 'blue', fontWeight: 'bold' }}>B2 Level Word</span>,{' '}
            C1: <span style={{ color: 'red' }}>C1 Level Word</span>,{' '}
            C2: <span style={{ color: 'red', fontWeight: 'bold' }}>C2 Level Word</span>,{' '}
            NA content words: <span style={{ color: 'orange' }}>Other Content Word</span>,{' '}
            NA others: <span>NA Other Word</span>
          </div>

          <hr className="my-6" />

          <h3 className="text-2xl font-bold text-green-600">
            Estimated CEFR-J Level: {results.level}
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-4 py-2">Index</th>
                  <th className="border border-gray-300 px-4 py-2">AvrDiff</th>
                  <th className="border border-gray-300 px-4 py-2">BperA</th>
                  <th className="border border-gray-300 px-4 py-2">CVV1</th>
                  <th className="border border-gray-300 px-4 py-2">AvrFreqRank</th>
                  <th className="border border-gray-300 px-4 py-2">ARI</th>
                  <th className="border border-gray-300 px-4 py-2">VperSent</th>
                  <th className="border border-gray-300 px-4 py-2">POStypes</th>
                  <th className="border border-gray-300 px-4 py-2">LenNP</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(REFERENCE_VALUES).map(([level, values]) => (
                  <tr key={level}>
                    <td className="border border-gray-300 px-4 py-2 font-medium">{level}</td>
                    <td className="border border-gray-300 px-4 py-2">{values.avrDiff.toFixed(2)}</td>
                    <td className="border border-gray-300 px-4 py-2">{values.bperA.toFixed(2)}</td>
                    <td className="border border-gray-300 px-4 py-2">{values.cvv1.toFixed(2)}</td>
                    <td className="border border-gray-300 px-4 py-2">{values.avrFreqRank.toFixed(2)}</td>
                    <td className="border border-gray-300 px-4 py-2">{values.ari.toFixed(2)}</td>
                    <td className="border border-gray-300 px-4 py-2">{values.vperSent.toFixed(2)}</td>
                    <td className="border border-gray-300 px-4 py-2">{values.posTypes.toFixed(2)}</td>
                    <td className="border border-gray-300 px-4 py-2">{values.lenNP.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="font-bold">
                  <th className="border border-gray-300 px-4 py-2">Input Text</th>
                  <td className="border border-gray-300 px-4 py-2">{results.metrics.avrDiff.toFixed(2)}</td>
                  <td className="border border-gray-300 px-4 py-2">{results.metrics.bperA.toFixed(2)}</td>
                  <td className="border border-gray-300 px-4 py-2 bg-gray-200">{results.metrics.cvv1.toFixed(2)}</td>
                  <td className="border border-gray-300 px-4 py-2">{results.metrics.avrFreqRank.toFixed(2)}</td>
                  <td className="border border-gray-300 px-4 py-2">{results.metrics.ari.toFixed(2)}</td>
                  <td className="border border-gray-300 px-4 py-2 bg-gray-200">{results.metrics.vperSent.toFixed(2)}</td>
                  <td className="border border-gray-300 px-4 py-2">{results.metrics.posTypes.toFixed(2)}</td>
                  <td className="border border-gray-300 px-4 py-2">{results.metrics.lenNP.toFixed(2)}</td>
                </tr>
                <tr>
                  <th className="border border-gray-300 px-4 py-2">Score (0-7)</th>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="h-20 bg-gray-200 relative">
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-blue-500"
                        style={{ height: `${getScorePercentage(getMetricScore('avrDiff', results.metrics.avrDiff))}%` }}
                      />
                    </div>
                    <div className="text-center mt-1">
                      {getMetricScore('avrDiff', results.metrics.avrDiff).toFixed(2)}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="h-20 bg-gray-200 relative">
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-blue-500"
                        style={{ height: `${getScorePercentage(getMetricScore('bperA', results.metrics.bperA))}%` }}
                      />
                    </div>
                    <div className="text-center mt-1">
                      {getMetricScore('bperA', results.metrics.bperA).toFixed(2)}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="h-20 bg-gray-200 relative">
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-blue-500"
                        style={{ height: `${getScorePercentage(getMetricScore('cvv1', results.metrics.cvv1))}%` }}
                      />
                    </div>
                    <div className="text-center mt-1">
                      {getMetricScore('cvv1', results.metrics.cvv1).toFixed(2)}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="h-20 bg-gray-200 relative">
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-blue-500"
                        style={{ height: `${getScorePercentage(getMetricScore('avrFreqRank', results.metrics.avrFreqRank))}%` }}
                      />
                    </div>
                    <div className="text-center mt-1">
                      {getMetricScore('avrFreqRank', results.metrics.avrFreqRank).toFixed(2)}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="h-20 bg-gray-200 relative">
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-blue-500"
                        style={{ height: `${getScorePercentage(getMetricScore('ari', results.metrics.ari))}%` }}
                      />
                    </div>
                    <div className="text-center mt-1">
                      {getMetricScore('ari', results.metrics.ari).toFixed(2)}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="h-20 bg-gray-200 relative">
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-blue-500"
                        style={{ height: `${getScorePercentage(getMetricScore('vperSent', results.metrics.vperSent))}%` }}
                      />
                    </div>
                    <div className="text-center mt-1">
                      {getMetricScore('vperSent', results.metrics.vperSent).toFixed(2)}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">-</td>
                  <td className="border border-gray-300 px-4 py-2">-</td>
                </tr>
                <tr>
                  <th className="border border-gray-300 px-4 py-2">Sub-level</th>
                  <td className="border border-gray-300 px-4 py-2">{getSubLevel('avrDiff', results.metrics.avrDiff)}</td>
                  <td className="border border-gray-300 px-4 py-2">{getSubLevel('bperA', results.metrics.bperA)}</td>
                  <td className="border border-gray-300 px-4 py-2 bg-gray-200">{getSubLevel('cvv1', results.metrics.cvv1)}</td>
                  <td className="border border-gray-300 px-4 py-2">{getSubLevel('avrFreqRank', results.metrics.avrFreqRank)}</td>
                  <td className="border border-gray-300 px-4 py-2">{getSubLevel('ari', results.metrics.ari)}</td>
                  <td className="border border-gray-300 px-4 py-2 bg-gray-200">{getSubLevel('vperSent', results.metrics.vperSent)}</td>
                  <td className="border border-gray-300 px-4 py-2">-</td>
                  <td className="border border-gray-300 px-4 py-2">-</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-sm text-gray-600">
            #Cells highlighted in gray are not used for level assessment.
          </p>

          <div className="mt-8 text-center">
            <button
              onClick={() => setResults(null)}
              className="px-6 py-2 bg-gray-500 text-white hover:bg-gray-600 rounded transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}