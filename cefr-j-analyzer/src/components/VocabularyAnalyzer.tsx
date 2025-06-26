import { useState } from "react";
import { processText } from "../services/textProcessor";
import type {
  VocabularyLevel,
  VocabularyMetrics,
} from "../services/levelCalculator";
import { analyzeVocabularyLevel } from "../services/levelCalculator";
import { analyzeVerbsPerSentence } from "../services/verbAnalyzer";
import type { VerbAnalysisResult } from "../services/verbAnalyzer";

const SAMPLE_TEXT = `Writing is the act of recording language on a visual medium using a set of symbols. The symbols must be known to others, so that the text may be read. A text may also use other visual systems, such as illustrations and decorations. These are not called writing, but may help the message work. Usually, all educated people in a country use the same writing system to record the same language. To be able to read and write is to be literate.`;

const REFERENCE_VALUES = {
  A1: {
    avrDiff: 1.28,
    bperA: 0.06,
    cvv1: 1.93,
    avrFreqRank: 367.99,
    ari: 4.1,
    vperSent: 1.51,
    posTypes: 7.16,
    lenNP: 2.94,
  },
  A2: {
    avrDiff: 1.44,
    bperA: 0.12,
    cvv1: 2.95,
    avrFreqRank: 445.92,
    ari: 6.22,
    vperSent: 2.05,
    posTypes: 8.14,
    lenNP: 3.36,
  },
  B1: {
    avrDiff: 1.57,
    bperA: 0.18,
    cvv1: 3.9,
    avrFreqRank: 514.55,
    ari: 7.82,
    vperSent: 2.66,
    posTypes: 8.73,
    lenNP: 3.64,
  },
  B2: {
    avrDiff: 1.74,
    bperA: 0.26,
    cvv1: 4.67,
    avrFreqRank: 613.05,
    ari: 9.19,
    vperSent: 2.95,
    posTypes: 9.04,
    lenNP: 3.99,
  },
  C1: {
    avrDiff: 1.91,
    bperA: 0.36,
    cvv1: 5.58,
    avrFreqRank: 739.3,
    ari: 10.79,
    vperSent: 3.28,
    posTypes: 9.36,
    lenNP: 4.51,
  },
  C2: {
    avrDiff: 2.08,
    bperA: 0.48,
    cvv1: 6.47,
    avrFreqRank: 865.5,
    ari: 12.4,
    vperSent: 3.61,
    posTypes: 9.68,
    lenNP: 5.03,
  },
};

export function VocabularyAnalyzer() {
  const [text, setText] = useState("");
  const [results, setResults] = useState<VocabularyLevel | null>(null);
  const [verbAnalysis, setVerbAnalysis] = useState<VerbAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const wordCount = text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  const analyzeText = async () => {
    if (wordCount < 10 || wordCount > 1000) {
      setError("Please enter between 10 and 1000 words.");
      return;
    }

    setIsAnalyzing(true);
    setError("");

    try {
      console.log("Starting analysis...");
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Processing text...");
      const processedText = processText(text);
      console.log("Text processed:", processedText);
      
      console.log("Analyzing vocabulary level...");
      const analysisResults = analyzeVocabularyLevel(text, processedText);
      console.log("Vocabulary analysis complete:", analysisResults);
      
      console.log("Analyzing verbs per sentence...");
      const verbAnalysisResults = analyzeVerbsPerSentence(processedText);
      console.log("Verb analysis complete:", verbAnalysisResults);
      
      setResults(analysisResults);
      setVerbAnalysis(verbAnalysisResults);
    } catch (error) {
      console.error("Analysis error:", error);
      console.error("Error stack:", (error as Error).stack);
      setError("An error occurred during analysis. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadSampleText = () => {
    setText(SAMPLE_TEXT);
    setResults(null);
    setVerbAnalysis(null);
    setError("");
  };

  const clearText = () => {
    setText("");
    setResults(null);
    setVerbAnalysis(null);
    setError("");
  };

  const getScorePercentage = (score: number) => (score / 7) * 100;

  const getSubLevel = (
    metric: keyof VocabularyMetrics,
    value: number
  ): string => {
    let closestLevel = "A1";
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
                <span className="text-red-500 ml-2">
                  Minimum 10 words required
                </span>
              )}
              {wordCount > 1000 && (
                <span className="text-red-500 ml-2">
                  Maximum 1000 words allowed
                </span>
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
              {isAnalyzing ? "Analyzing..." : "Analyze"}
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
                className={word.bold ? "font-bold" : ""}
              >
                {word.word}
              </span>
            ))}
          </div>

          <div className="mt-3 mb-3">
            <strong>Total content words:</strong> {wordCount}
          </div>

          <div className="bg-gray-100 p-3 rounded">
            <strong>Legend:</strong>
            <br />
            A1: <span style={{ color: "#32cd32" }}>A1 Level Word</span>, A2:{" "}
            <span style={{ color: "#32cd32", fontWeight: "bold" }}>
              A2 Level Word
            </span>
            , B1: <span style={{ color: "blue" }}>B1 Level Word</span>, B2:{" "}
            <span style={{ color: "blue", fontWeight: "bold" }}>
              B2 Level Word
            </span>
            , C1: <span style={{ color: "red" }}>C1 Level Word</span>, C2:{" "}
            <span style={{ color: "red", fontWeight: "bold" }}>
              C2 Level Word
            </span>
            , NA content words:{" "}
            <span style={{ color: "orange" }}>Other Content Word</span>, NA
            others: <span>NA Other Word</span>
          </div>

          <hr className="my-6" />

          <h3 className="text-2xl font-bold text-green-600">
            Estimated CEFR-J Level: {results.level}
          </h3>

          <div className="my-6">
            <h4 className="text-lg font-semibold mb-3">
              Vocabulary Statistics by CEFR Level
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2">CEFR</th>
                    <th className="border border-gray-300 px-4 py-2">Count</th>
                    <th className="border border-gray-300 px-4 py-2">AvrIdx</th>
                    <th className="border border-gray-300 px-4 py-2">verb</th>
                    <th className="border border-gray-300 px-4 py-2">noun</th>
                    <th className="border border-gray-300 px-4 py-2">
                      adjective
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {["A1", "A2", "B1", "B2", "C1", "C2"].map((level) => {
                    const stats = results.levelStatistics?.[level];
                    return (
                      <tr key={level}>
                        <td className="border border-gray-300 px-4 py-2 font-medium">
                          {level}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          {stats?.count || 0}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          {stats?.avrIdx || 0}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          {stats?.verb || 0}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          {stats?.noun || 0}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          {stats?.adjective || 0}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="border-t-2 border-gray-400">
                    <td className="border border-gray-300 px-4 py-2 font-bold">
                      SUM
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center font-bold">
                      {Object.values(results.levelStatistics || {}).reduce(
                        (sum, stats) => sum + stats.count,
                        0
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center font-bold">
                      {Object.values(results.levelStatistics || {}).reduce(
                        (sum, stats) => sum + stats.avrIdx,
                        0
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center font-bold">
                      {Object.values(results.levelStatistics || {}).reduce(
                        (sum, stats) => sum + stats.verb,
                        0
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center font-bold">
                      {Object.values(results.levelStatistics || {}).reduce(
                        (sum, stats) => sum + stats.noun,
                        0
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center font-bold">
                      {Object.values(results.levelStatistics || {}).reduce(
                        (sum, stats) => sum + stats.adjective,
                        0
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-4 py-2">Index</th>
                  <th className="border border-gray-300 px-4 py-2">AvrDiff</th>
                  <th className="border border-gray-300 px-4 py-2">BperA</th>
                  <th className="border border-gray-300 px-4 py-2">CVV1</th>
                  <th className="border border-gray-300 px-4 py-2">
                    AvrFreqRank
                  </th>
                  <th className="border border-gray-300 px-4 py-2">ARI</th>
                  <th className="border border-gray-300 px-4 py-2">VperSent</th>
                  <th className="border border-gray-300 px-4 py-2">POStypes</th>
                  <th className="border border-gray-300 px-4 py-2">LenNP</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(REFERENCE_VALUES).map(([level, values]) => (
                  <tr key={level}>
                    <td className="border border-gray-300 px-4 py-2 font-medium">
                      {level}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {values.avrDiff.toFixed(2)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {values.bperA.toFixed(2)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {values.cvv1.toFixed(2)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {values.avrFreqRank.toFixed(2)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {values.ari.toFixed(2)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {values.vperSent.toFixed(2)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {values.posTypes.toFixed(2)}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {values.lenNP.toFixed(2)}
                    </td>
                  </tr>
                ))}
                <tr className="font-bold">
                  <th className="border border-gray-300 px-4 py-2">
                    Input Text
                  </th>
                  <td className="border border-gray-300 px-4 py-2">
                    {results.metrics.avrDiff.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {results.metrics.bperA.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 bg-gray-200">
                    {results.metrics.cvv1.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {results.metrics.avrFreqRank.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {results.metrics.ari.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 bg-gray-200">
                    {results.metrics.vperSent.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {results.metrics.posTypes.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {results.metrics.lenNP.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <th className="border border-gray-300 px-4 py-2">
                    Score (0-7)
                  </th>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="h-20 bg-gray-200 relative">
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-blue-500"
                        style={{
                          height: `${getScorePercentage(
                            results.metricScores?.avrDiff || 0
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="text-center mt-1">
                      {(results.metricScores?.avrDiff || 0).toFixed(2)}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="h-20 bg-gray-200 relative">
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-blue-500"
                        style={{
                          height: `${getScorePercentage(
                            results.metricScores?.bperA || 0
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="text-center mt-1">
                      {(results.metricScores?.bperA || 0).toFixed(2)}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="h-20 bg-gray-200 relative">
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-blue-500"
                        style={{
                          height: `${getScorePercentage(
                            results.metricScores?.cvv1 || 0
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="text-center mt-1">
                      {(results.metricScores?.cvv1 || 0).toFixed(2)}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="h-20 bg-gray-200 relative">
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-blue-500"
                        style={{
                          height: `${getScorePercentage(
                            results.metricScores?.avrFreqRank || 0
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="text-center mt-1">
                      {(results.metricScores?.avrFreqRank || 0).toFixed(2)}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="h-20 bg-gray-200 relative">
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-blue-500"
                        style={{
                          height: `${getScorePercentage(
                            results.metricScores?.ari || 0
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="text-center mt-1">
                      {(results.metricScores?.ari || 0).toFixed(2)}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="h-20 bg-gray-200 relative">
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-blue-500"
                        style={{
                          height: `${getScorePercentage(
                            results.metricScores?.vperSent || 0
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="text-center mt-1">
                      {(results.metricScores?.vperSent || 0).toFixed(2)}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="h-20 bg-gray-200 relative">
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-blue-500"
                        style={{
                          height: `${getScorePercentage(
                            results.metricScores?.posTypes || 0
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="text-center mt-1">
                      {(results.metricScores?.posTypes || 0).toFixed(2)}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="h-20 bg-gray-200 relative">
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-blue-500"
                        style={{
                          height: `${getScorePercentage(
                            results.metricScores?.lenNP || 0
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="text-center mt-1">
                      {(results.metricScores?.lenNP || 0).toFixed(2)}
                    </div>
                  </td>
                </tr>
                <tr>
                  <th className="border border-gray-300 px-4 py-2">
                    Sub-level
                  </th>
                  <td className="border border-gray-300 px-4 py-2">
                    {getSubLevel("avrDiff", results.metrics.avrDiff)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {getSubLevel("bperA", results.metrics.bperA)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 bg-gray-200">
                    {getSubLevel("cvv1", results.metrics.cvv1)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {getSubLevel("avrFreqRank", results.metrics.avrFreqRank)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {getSubLevel("ari", results.metrics.ari)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 bg-gray-200">
                    {getSubLevel("vperSent", results.metrics.vperSent)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {getSubLevel("posTypes", results.metrics.posTypes)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {getSubLevel("lenNP", results.metrics.lenNP)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-sm text-gray-600">
            #Cells highlighted in gray are not used for level assessment.
          </p>

          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">
              Metric Calculation Details
            </h3>
            <div className="bg-blue-50 p-4 rounded mb-4">
              <h4 className="font-semibold mb-2">
                Metric Values Used in Calculations:
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Total CEFR-J Words:</strong>{" "}
                  {results.totalContentWords || 0}
                  <br />
                  <strong>Sentences:</strong> {results.sentenceCount || 0}
                  <br />
                  <strong>Total Verbs:</strong> {results.totalVerbs || 0}
                  <br />
                  <strong>Unique Verbs (excluding 'be'):</strong>{" "}
                  {results.uniqueVerbs || 0}
                  <br />
                </div>
                <div>
                  <strong>A-level Words (A1+A2):</strong>{" "}
                  {(results.levelStatistics?.A1?.count || 0) +
                    (results.levelStatistics?.A2?.count || 0)}
                  <br />
                  <strong>B-level Words (B1+B2):</strong>{" "}
                  {(results.levelStatistics?.B1?.count || 0) +
                    (results.levelStatistics?.B2?.count || 0)}
                  <br />
                  <strong>C-level Words (C1+C2):</strong>{" "}
                  {(results.levelStatistics?.C1?.count || 0) +
                    (results.levelStatistics?.C2?.count || 0)}
                  <br />
                  <strong>AvrDiff Calculation:</strong> Σ(level × count) / total
                  ={" "}
                  {Object.values(results.levelStatistics || {}).reduce(
                    (sum, stats) => sum + stats.avrIdx,
                    0
                  )}{" "}
                  / {results.totalContentWords || 0} ={" "}
                  {results.metrics.avrDiff.toFixed(2)}
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold mb-4">Indicator Descriptions</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">
                  AvrDiff
                  <span className="font-normal text-sm text-gray-600 ml-2">
                    = {results.metrics.avrDiff.toFixed(2)} (Score:{" "}
                    {(results.metricScores?.avrDiff || 0).toFixed(2)} ={" "}
                    {results.metrics.avrDiff.toFixed(2)} × 6.417 - 7.184)
                  </span>
                </h4>
                <p className="text-sm text-gray-700">
                  This index shows the average of word difficulties when A1 is
                  1, A2 is 2, B1 is 3, B2 is 4, C1 is 5, and C2 is 6. Word
                  levels are determined based on CEFR-J Wordlist and English
                  Vocabulary Profile for C level words. Functional words are
                  excluded from the calculation. If this index is high, you can
                  lower the text level by replacing higher level words with
                  easier ones (e.g., "inform" (B1) → "tell" (A1)).
                </p>
              </div>

              <div>
                <h4 className="font-semibold">
                  BperA
                  <span className="font-normal text-sm text-gray-600 ml-2">
                    = {results.metrics.bperA.toFixed(2)} (Score:{" "}
                    {(results.metricScores?.bperA || 0).toFixed(2)} ={" "}
                    {results.metrics.bperA.toFixed(2)} × 13.146 + 0.428)
                  </span>
                </h4>
                <p className="text-sm text-gray-700">
                  This shows the ratio of B level content words against A level
                  content words (nouns, verbs, adjectives, and adverbs).
                  Calculated as: B-level words / A-level words ={" "}
                  {(results.levelStatistics?.B1?.count || 0) +
                    (results.levelStatistics?.B2?.count || 0)}{" "}
                  /{" "}
                  {(results.levelStatistics?.A1?.count || 0) +
                    (results.levelStatistics?.A2?.count || 0)}{" "}
                  = {results.metrics.bperA.toFixed(2)}. If this index is high,
                  you can lower the text level by avoiding B level words.
                </p>
              </div>

              <div>
                <h4 className="font-semibold">
                  CVV1
                  <span className="font-normal text-sm text-gray-600 ml-2">
                    = {results.metrics.cvv1.toFixed(2)} (Score:{" "}
                    {(results.metricScores?.cvv1 || 0).toFixed(2)} ={" "}
                    {results.metrics.cvv1.toFixed(2)} × 1.1059 - 1.208)
                  </span>
                </h4>
                <p className="text-sm text-gray-700">
                  CVV1 is a measure of vocabulary diversity. It is calculated as
                  the ratio of unique verbs to the square root of the total
                  number of verbs times two. Calculated as: unique verbs / √(2 ×
                  total verbs) = {results.uniqueVerbs || 0} / √(2 ×{" "}
                  {results.totalVerbs || 0}) = {results.metrics.cvv1.toFixed(2)}
                  . A higher CVV1 indicates greater vocabulary diversity, which
                  may suggest a higher text level. If this index is high, you
                  can lower the text level by reducing vocabulary diversity.
                </p>
              </div>

              <div>
                <h4 className="font-semibold">
                  AvrFreqRank
                  <span className="font-normal text-sm text-gray-600 ml-2">
                    = {results.metrics.avrFreqRank.toFixed(2)} (Score:{" "}
                    {(results.metricScores?.avrFreqRank || 0).toFixed(2)} ={" "}
                    {results.metrics.avrFreqRank.toFixed(2)} × 0.004 - 0.608)
                  </span>
                </h4>
                <p className="text-sm text-gray-700">
                  AvrFreqRank represents the average frequency rank of the words
                  in the text including functional words. A lower value
                  indicates that more common words are used, potentially
                  suggesting a lower text level. The three least frequent words
                  are excluded to avoid anomalies. If this index is high, you
                  can reduce the text level by using more common words.
                </p>
              </div>

              <div>
                <h4 className="font-semibold">
                  ARI
                  <span className="font-normal text-sm text-gray-600 ml-2">
                    = {results.metrics.ari.toFixed(2)} (Score:{" "}
                    {(results.metricScores?.ari || 0).toFixed(2)} ={" "}
                    {results.metrics.ari.toFixed(2)} × 0.607 - 1.632)
                  </span>
                </h4>
                <p className="text-sm text-gray-700">
                  ARI is a readability index which is calculated using the
                  following formula (with text statistics from wink-nlp):
                  <br />
                  4.71(characters/words) + 0.5(words/sentences) - 21.43
                  <br />
                  This index is sensitive to sentence and word lengths. If this
                  index is high, you can lower the text level by separating
                  sentences or using shorter words.
                </p>
              </div>

              <div>
                <h4 className="font-semibold">
                  VperSent
                  <span className="font-normal text-sm text-gray-600 ml-2">
                    = {results.metrics.vperSent.toFixed(2)} (Score:{" "}
                    {(results.metricScores?.vperSent || 0).toFixed(2)} ={" "}
                    {results.metrics.vperSent.toFixed(2)} × 2.203 - 2.486)
                  </span>
                </h4>
                <p className="text-sm text-gray-700">
                  VperSent, which stands for "Verbs per Sentence", is an average
                  rate of verbs included in each sentence. If this index is high,
                  you can lower the text level by using simpler constructions
                  (e.g., avoiding passive, gerund, and past participles).
                </p>
                {verbAnalysis && (
                  <div className="mt-4">
                    <details className="bg-gray-50 p-4 rounded">
                      <summary className="cursor-pointer font-semibold text-sm">
                        Click to view detailed verb count per sentence
                      </summary>
                      <div className="mt-3 overflow-x-auto">
                        <table className="w-full text-sm border-collapse border border-gray-300">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="border border-gray-300 px-3 py-2 text-left">Sentence #</th>
                              <th className="border border-gray-300 px-3 py-2 text-left">Sentence Text</th>
                              <th className="border border-gray-300 px-3 py-2 text-left">Verbs Found</th>
                              <th className="border border-gray-300 px-3 py-2 text-center">Verb Count</th>
                            </tr>
                          </thead>
                          <tbody>
                            {verbAnalysis.sentences.map((sentence) => (
                              <tr key={sentence.sentenceNumber}>
                                <td className="border border-gray-300 px-3 py-2 text-center">
                                  {sentence.sentenceNumber}
                                </td>
                                <td className="border border-gray-300 px-3 py-2">
                                  {sentence.sentenceText}
                                </td>
                                <td className="border border-gray-300 px-3 py-2">
                                  {sentence.verbs.join(", ") || "-"}
                                </td>
                                <td className="border border-gray-300 px-3 py-2 text-center">
                                  {sentence.verbCount}
                                </td>
                              </tr>
                            ))}
                            <tr className="font-bold bg-gray-100">
                              <td className="border border-gray-300 px-3 py-2 text-center" colSpan={2}>
                                Average (VperSent)
                              </td>
                              <td className="border border-gray-300 px-3 py-2">
                                Total verbs: {verbAnalysis.totalVerbs} / Total sentences: {verbAnalysis.totalSentences}
                              </td>
                              <td className="border border-gray-300 px-3 py-2 text-center">
                                {verbAnalysis.averageVerbsPerSentence.toFixed(2)}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </details>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-semibold">
                  POStypes
                  <span className="font-normal text-sm text-gray-600 ml-2">
                    = {results.metrics.posTypes.toFixed(2)} (Score:{" "}
                    {(results.metricScores?.posTypes || 0).toFixed(2)} ={" "}
                    {results.metrics.posTypes.toFixed(2)} × 1.768 - 12.006)
                  </span>
                </h4>
                <p className="text-sm text-gray-700">
                  POStypes measures the average number of distinct parts of speech
                  per sentence, based on grammatical analysis using wink-nlp. A higher
                  value indicates a more varied use of grammatical structures, which
                  may suggest a higher text level. If this index is high, you can
                  lower the text level by using simpler and less varied parts of speech.
                </p>
              </div>

              <div>
                <h4 className="font-semibold">
                  LenNP
                  <span className="font-normal text-sm text-gray-600 ml-2">
                    = {results.metrics.lenNP.toFixed(2)} (Score:{" "}
                    {(results.metricScores?.lenNP || 0).toFixed(2)} ={" "}
                    {results.metrics.lenNP.toFixed(2)} × 2.629 - 6.697)
                  </span>
                </h4>
                <p className="text-sm text-gray-700">
                  LenNP represents the average length of noun phrases per
                  sentence. This value is calculated by performing structural
                  analysis using wink-nlp to identify noun phrases and their
                  modifiers. A longer average length indicates more complex noun
                  phrases, which may suggest a higher text level. If this index
                  is high, you can lower the text level by using shorter and
                  simpler noun phrases.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setResults(null);
                setVerbAnalysis(null);
              }}
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
