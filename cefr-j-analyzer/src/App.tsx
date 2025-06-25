import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { VocabularyAnalyzer } from './components/VocabularyAnalyzer';
import { WritingAnalyzer } from './components/WritingAnalyzer';
import { CombinedAnalyzer } from './components/CombinedAnalyzer';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="vocabulary" element={<VocabularyAnalyzer />} />
          <Route path="writing" element={<WritingAnalyzer />} />
          <Route path="combined" element={<CombinedAnalyzer />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;