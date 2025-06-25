import React from 'react';
import { Link, Outlet } from 'react-router-dom';

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-800">
                CEFR-J Level Analyzer
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/vocabulary"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Vocabulary Analyzer
              </Link>
              <Link
                to="/writing"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Writing Analyzer
              </Link>
              <Link
                to="/combined"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Combined Analysis
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto py-8">
        <Outlet />
      </main>
      <footer className="bg-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-sm text-gray-600">
            <p className="mb-2">Credits:</p>
            <p>『CEFR-J Wordlist Version 1.6』 東京外国語大学投野由紀夫研究室. （URL: http://www.cefr-j.org/download.html より 2022 年 2 月ダウンロード）</p>
            <p>『DiQt English-Japanese Dictionary』BooQs Inc.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}