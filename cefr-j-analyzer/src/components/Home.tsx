import React from 'react';
import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div className="max-w-4xl mx-auto px-4">
      <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        CEFR-J Level Analyzer
      </h1>
      
      <p className="text-lg text-gray-700 text-center mb-12">
        Comprehensive English proficiency assessment tool based on CEFR-J standards
      </p>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Link
          to="/vocabulary"
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-3 text-blue-600">
            Vocabulary Level Analyzer
          </h2>
          <p className="text-gray-600 mb-4">
            Analyze vocabulary complexity and assign CEFR-J levels to your text
          </p>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>• 10-1000 words</li>
            <li>• 8 linguistic metrics</li>
            <li>• Color-coded results</li>
          </ul>
        </Link>

        <Link
          to="/writing"
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-3 text-green-600">
            Writing Level Analyzer
          </h2>
          <p className="text-gray-600 mb-4">
            Assess writing proficiency with AI-powered analysis and corrections
          </p>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>• 10-500 words</li>
            <li>• AI-powered feedback</li>
            <li>• Sentence corrections</li>
          </ul>
        </Link>

        <Link
          to="/combined"
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-3 text-purple-600">
            Combined Analysis
          </h2>
          <p className="text-gray-600 mb-4">
            Get comprehensive assessment combining vocabulary and writing analysis
          </p>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>• Full text analysis</li>
            <li>• Detailed metrics</li>
            <li>• Holistic assessment</li>
          </ul>
        </Link>
      </div>

      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">About CEFR-J</h3>
        <p className="text-gray-700 mb-3">
          CEFR-J is an adaptation of the Common European Framework of Reference (CEFR) 
          specifically designed for Japanese learners of English. It provides more granular 
          levels (e.g., A1.1, A1.2, A1.3) to better track progress in the earlier stages 
          of language learning.
        </p>
        <p className="text-gray-700">
          This analyzer uses the official CEFR-J Wordlist and sophisticated algorithms 
          to provide accurate level assessments for both vocabulary and writing proficiency.
        </p>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Powered by CEFR-J research from Tokyo University of Foreign Studies</p>
      </div>
    </div>
  );
}