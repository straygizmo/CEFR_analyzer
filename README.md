# CEFR-J Level Analyzer

A comprehensive web application for analyzing English text proficiency based on CEFR-J standards. This tool combines vocabulary complexity analysis with writing quality assessment to provide detailed feedback for language learners and educators.
Very much inspired by these sites.
https://cvla.langedu.jp/
https://cwla.langedu.jp/

## Features

### 📊 Vocabulary Level Analyzer
- Analyzes text vocabulary complexity using the official CEFR-J Wordlist
- Supports 10-1000 word texts
- Provides 8 linguistic metrics for comprehensive assessment
- Color-coded word visualization by CEFR-J level
- Detailed score breakdown and level estimation

### ✍️ Writing Level Analyzer (not implemented)
- Assesses writing proficiency for texts of 10-500 words
- Two modes: Quick Check and Full Assessment
- AI-powered analysis for writing quality metrics
- Sentence-by-sentence corrections with explanations
- Support for English and Japanese feedback

### 🔄 Combined Analysis (not implemented)
- Holistic assessment combining vocabulary and writing analysis
- Comprehensive CEFR-J level determination
- Detailed recommendations for improvement
- Visual representation of all metrics

## Technology Stack

- **Frontend**: React 19 with TypeScript
- **Routing**: React Router v7
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Deployment**: Cloudflare Workers
- **Data Processing**: Custom tokenization and POS tagging

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/cefr-j-analyzer.git
cd cefr-j-analyzer
```

2. Install dependencies
```bash
npm install
```

3. Convert data files
```bash
npm run convert-data
```

4. Run development server
```bash
npm run dev
```

### Deployment

1. Configure your Cloudflare account in `wrangler.toml`
2. Add your Gemini API key as a secret:
```bash
wrangler secret put GEMINI_API_KEY
```
3. Deploy to Cloudflare Workers:
```bash
npm run build
wrangler deploy
```

## Usage

1. Navigate to the home page
2. Choose your analysis type:
   - **Vocabulary Analyzer**: For vocabulary complexity assessment
   - **Writing Analyzer**: For writing quality evaluation
   - **Combined Analysis**: For comprehensive text analysis
3. Enter or paste your text (10-1000 words for vocabulary, 10-500 for writing)
4. Click "Analyze" and wait for results
5. Review the detailed feedback and recommendations

## CEFR-J Levels

CEFR-J extends the Common European Framework with more granular levels for Japanese learners:
- **Pre-A1**: Beginner
- **A1.1, A1.2, A1.3**: Elementary
- **A2.1, A2.2**: Pre-intermediate
- **B1.1, B1.2**: Intermediate
- **B2.1, B2.2**: Upper-intermediate
- **C1, C2**: Advanced

## Credits

『CEFR-J Wordlist Version 1.6』 東京外国語大学投野由紀夫研究室. （URL: http://www.cefr-j.org/download.html より 2022 年 2 月ダウンロード）

『DiQt English-Japanese Dictionary』BooQs Inc.

## Citation

When using this tool for research, please cite:

Uchida S., & Neigishi, M. (to appear) Estimating the CEFR-J level of English reading passages: Development and accuracy of CVLA3『英語コーパス研究』32. https://cvla.langedu.jp/static/Uchida_Negishi_2025.pdf

Uchida, S. and Negishi, M. (2025). Assigning CEFR-J levels to English learners' writing: An approach using lexical metrics and generative AI. *Research Methods in Applied Linguistics, 4*(2), 100199. https://doi.org/10.1016/j.rmal.2025.100199

## License

This project (only the code, not data) is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
