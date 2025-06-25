import React, { useState } from 'react';
import { analyzeWriting, WritingAnalysisResult } from '../services/writingAnalyzer';

const SAMPLE_TEXT = `I agree that parents should limit the amount of time children spend online. First, we may get bad from using the Internet for long time, for example, lack of sleep, bad eyes. Second, we have less comunication with family and friends. If you spend a lot on Internet, you will see a decrese in your relationship with your friends and your social skills. For these reasons, I am for limiting time children spend online.`;

export function WritingAnalyzer() {
  const [text, setText] = useState('');
  const [mode, setMode] = useState<'check' | 'assess'>('assess');
  const [correctionType, setCorrectionType] = useState<'table' | 'track'>('table');
  const [feedbackLanguage, setFeedbackLanguage] = useState<'English' | 'Japanese'>('English');
  const [results, setResults] = useState<WritingAnalysisResult | null>(null);
  const [checkFeedback, setCheckFeedback] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [dailyWordCount] = useState(0); // In production, track this in localStorage or backend

  const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;

  const handleCheck = async () => {
    if (wordCount < 10 || wordCount > 500) {
      setError('Please enter between 10 and 500 words.');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simple feedback for check mode
      const feedback = [
        'This sentence is clear, but consider adding a transition word at the beginning for a smoother introduction to your argument.',
        'The phrase "get bad" is a bit unclear. You might want to think of a more specific way to express the negative effects.',
        'Please check the spelling of the word "comunication." Additionally, consider rephrasing "less communication" to make it sound more natural.',
        'The phrase "spend a lot on Internet" could be improved for clarity. Also, please check the spelling of the word "decrese."',
        'The phrase "I am for limiting time children spend online" could be made more concise.'
      ];
      
      setCheckFeedback(feedback);
    } catch (err) {
      setError('An error occurred during analysis. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAssess = async () => {
    if (wordCount < 10 || wordCount > 500) {
      setError('Please enter between 10 and 500 words.');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      // Simulate longer processing for full assessment
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const result = await analyzeWriting(text, 'assess');
      setResults(result);
    } catch (err) {
      setError('An error occurred during analysis. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadSampleText = () => {
    setText(SAMPLE_TEXT);
    setResults(null);
    setCheckFeedback([]);
    setError('');
  };

  const renderCorrections = () => {
    if (!results || results.corrections.length === 0) return null;

    if (correctionType === 'table') {
      return (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">Original Sentence</th>
              <th className="border border-gray-300 px-4 py-2">Corrected Sentence</th>
              <th className="border border-gray-300 px-4 py-2">Comment</th>
            </tr>
          </thead>
          <tbody>
            {results.corrections.map((correction, idx) => (
              <tr key={idx}>
                <td className="border border-gray-300 px-4 py-2">
                  {correction.original.split(' ').map((word, i) => {
                    const correctedWords = correction.corrected.split(' ');
                    if (word !== correctedWords[i]) {
                      return (
                        <span key={i}>
                          <span className="line-through text-red-500">{word}</span>{' '}
                        </span>
                      );
                    }
                    return <span key={i}>{word} </span>;
                  })}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {correction.corrected.split(' ').map((word, i) => {
                    const originalWords = correction.original.split(' ');
                    if (word !== originalWords[i]) {
                      return <span key={i} className="text-blue-600">{word} </span>;
                    }
                    return <span key={i}>{word} </span>;
                  })}
                </td>
                <td className="border border-gray-300 px-4 py-2">{correction.comment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else {
      // Track changes view
      return (
        <div className="space-y-4">
          {results.corrections.map((correction, idx) => (
            <div key={idx} className="p-4 bg-gray-50 rounded">
              <p className="mb-2">
                {correction.original.split(' ').map((word, i) => {
                  const correctedWords = correction.corrected.split(' ');
                  if (word !== correctedWords[i]) {
                    return (
                      <span key={i}>
                        <span className="line-through text-red-500">{word}</span>
                        <span className="text-blue-600"> {correctedWords[i]}</span>{' '}
                      </span>
                    );
                  }
                  return <span key={i}>{word} </span>;
                })}
              </p>
              <p className="text-sm text-gray-600 italic">{correction.comment}</p>
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">
        <a href="/" className="text-blue-600 hover:underline">
          CWLA2.1: CEFR-based Writing Level Analyzer
        </a>
      </h2>

      {!results && checkFeedback.length === 0 ? (
        <div className="space-y-6">
          <div className="bg-green-50 p-4 rounded">
            <h3 className="text-green-700 font-semibold mb-2">About</h3>
            <p className="text-sm">
              CWLA2 estimates the CEFR-J level of English learners' writing (preA1, A1.1, A1.2, A1.3, A2.1, A2.2, B1.1, B1.2, B2.1, B2.2, C1, C2). 
              Please input text between 10 and 500 words. The tool is primarily designed for high school-level compositions.
            </p>
          </div>

          <div className="bg-yellow-50 p-4 rounded">
            <h3 className="text-yellow-700 font-semibold mb-2">Notes</h3>
            <ul className="text-sm space-y-1">
              <li>• Processing takes approximately <strong>10-20 seconds</strong>. Please be patient.</li>
              <li>• The server may reject inputs containing special characters. Avoid full-width spaces, ampersands (&), parentheses (()), etc.</li>
              <li>• Due to API limitations, the daily input limit is approximately <strong>30,000 words</strong>.</li>
            </ul>
          </div>

          <div>
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

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Correction Type:</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="table"
                    checked={correctionType === 'table'}
                    onChange={(e) => setCorrectionType(e.target.value as 'table' | 'track')}
                    className="mr-2"
                  />
                  Table Format
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="track"
                    checked={correctionType === 'track'}
                    onChange={(e) => setCorrectionType(e.target.value as 'table' | 'track')}
                    className="mr-2"
                  />
                  Track Changes
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Select Feedback Language:</label>
              <select
                value={feedbackLanguage}
                onChange={(e) => setFeedbackLanguage(e.target.value as 'English' | 'Japanese')}
                className="px-3 py-2 border border-gray-300 rounded"
              >
                <option value="English">English</option>
                <option value="Japanese">Japanese</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={loadSampleText}
              className="px-4 py-2 text-blue-600 hover:underline"
            >
              Sample
            </button>
            <button
              onClick={handleCheck}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded transition-colors disabled:bg-gray-400"
              disabled={wordCount < 10 || wordCount > 500 || isAnalyzing}
            >
              {isAnalyzing ? 'Checking...' : 'Check Writing'}
            </button>
            <button
              onClick={handleAssess}
              className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded transition-colors disabled:bg-gray-400"
              disabled={wordCount < 10 || wordCount > 500 || isAnalyzing}
            >
              {isAnalyzing ? 'Assessing...' : 'Assess Writing'}
            </button>
          </div>

          <hr />
          <p className="text-sm text-gray-600">Daily word count: {dailyWordCount}</p>
        </div>
      ) : checkFeedback.length > 0 ? (
        // Check Writing Results
        <div className="space-y-6">
          <h4 className="text-xl font-semibold">
            <span className="bg-blue-600 text-white px-3 py-1 rounded">Feedback</span>
          </h4>
          
          <div className="space-y-4">
            {text.split(/(?<=[.!?])\s+/).map((sentence, idx) => (
              <div key={idx}>
                <p className="font-semibold mb-2">{sentence}</p>
                {checkFeedback[idx] && (
                  <p className="text-gray-700 ml-4">{checkFeedback[idx]}</p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setCheckFeedback([]);
                setText('');
              }}
              className="px-6 py-2 bg-gray-500 text-white hover:bg-gray-600 rounded transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      ) : results ? (
        // Assess Writing Results
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">
            <span className="bg-blue-600 text-white px-3 py-1 rounded">CWLA2 Evaluation Results</span>
          </h2>
          
          <h4 className="text-xl font-semibold">CEFR-J Level: {results.level}</h4>
          <p>Total Score: {results.totalScore.toFixed(1)}</p>

          <div>
            <h4 className="text-lg font-semibold mb-2">Analyzed Text:</h4>
            <p className="p-4 bg-gray-50 rounded">
              {results.coloredText.map((word, index) => (
                <span
                  key={index}
                  style={{ 
                    color: word.color,
                    fontStyle: word.italic ? 'italic' : 'normal'
                  }}
                  className={word.bold ? 'font-bold' : ''}
                >
                  {word.word}
                </span>
              ))}
            </p>
          </div>

          <div className="bg-gray-100 p-3 rounded text-sm">
            [Legend] A1: <span style={{ color: '#32cd32' }}>example</span>, 
            A2: <span style={{ color: '#32cd32', fontWeight: 'bold' }}>example</span>,
            B1: <span style={{ color: 'blue' }}>example</span>, 
            B2: <span style={{ color: 'blue', fontWeight: 'bold' }}>example</span>,
            Other content words: <span style={{ color: 'orange' }}>example</span>, 
            Spelling errors: <span style={{ color: 'red', fontStyle: 'italic' }}>example</span>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-2">Score Breakdown:</h4>
            <ul className="space-y-1">
              <li>AvrDiff: {results.metrics.avrDiff.toFixed(2)} ({(results.metrics.avrDiff * 0.7).toFixed(2)})</li>
              <li>BperA: {results.metrics.bperA.toFixed(2)} ({(results.metrics.bperA * 5).toFixed(2)})</li>
              <li>Complexity: {results.metrics.complexity}</li>
              <li>Accuracy: {results.metrics.accuracy}</li>
              <li>Fluency: {results.metrics.fluency}</li>
              <li>Logicality: {results.metrics.logicality}</li>
              <li>Sophistication: {results.metrics.sophistication}</li>
              <li>Total: = ((AvrDiff + BperA)/2 + Complexity + Accuracy + Fluency + Logicality + Sophistication) / 6 * 100</li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-2">Bar Chart:</h4>
            <div className="flex gap-4 items-end h-48">
              {Object.entries(results.metrics).map(([key, value]) => (
                <div key={key} className="flex-1 text-center">
                  <div className="bg-gray-200 relative" style={{ height: '100%' }}>
                    <div 
                      className="absolute bottom-0 left-0 right-0 bg-blue-500"
                      style={{ height: `${(value / 7) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs mt-1">{key}</p>
                  <p className="text-sm font-semibold">{typeof value === 'number' ? value.toFixed(1) : value}</p>
                </div>
              ))}
            </div>
          </div>

          {results.corrections.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold mb-2">Correction Results:</h4>
              {renderCorrections()}
            </div>
          )}

          <div>
            <h4 className="text-lg font-semibold mb-2">Feedback:</h4>
            <p className="text-gray-700">{results.feedback}</p>
          </div>

          <div className="mt-8 text-center">
            <a
              href="/writing"
              className="text-blue-600 hover:underline mr-4"
            >
              Return to Top
            </a>
            <button
              onClick={() => {
                setResults(null);
                setText('');
              }}
              className="px-6 py-2 bg-gray-500 text-white hover:bg-gray-600 rounded transition-colors"
            >
              New Analysis
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}