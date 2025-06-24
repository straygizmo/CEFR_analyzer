# CEFR-J Level Analyzer Project

## Project Overview
Create a comprehensive CEFR-J level analyzer that combines vocabulary and writing level analysis into a single responsive web application. The analyzer will help users assess English proficiency levels according to CEFR-J standards (preA1 to C2).

## Key Requirements

### 1. Technology Stack
- **Frontend**: React with React Router v7
- **Deployment**: Cloudflare Workers
- **AI Integration**: Gemini API for writing analysis
- **Styling**: Responsive design (Tailwind CSS recommended)

### 2. Core Features

#### Vocabulary Level Analyzer (based on https://cvla.langedu.jp/)
- Accept text input (10-1000 words) or file upload (.txt files)
- Analyze vocabulary using CEFR-J Wordlist Version 1.6
- Display level distribution and overall assessment
- Use statistical methods (exclude min/max values for stability)

#### Writing Level Analyzer (based on https://cwla.langedu.jp/)
- Accept text input (10-500 words)
- Two analysis modes:
  1. **Check Writing**: Quick feedback mode
     - Provides sentence-by-sentence feedback without corrections
     - Lists specific issues and suggestions for each sentence
     - Faster processing
  2. **Assess Writing**: Full assessment mode
     - Complete CEFR-J level assessment with scores
     - Detailed corrections with track changes
     - Comprehensive metrics and visualization
- Support both English and Japanese feedback
- Correction display options: Table format or Track changes
- Display results including (for Assess Writing mode):
  - CEFR-J Level assessment (e.g., B1.2)
  - Total Score calculation
  - Color-coded analyzed text (same scheme as vocabulary analyzer)
  - Spelling errors highlighted in red italic
  - Score breakdown with 7 metrics:
    1. AvrDiff (vocabulary difficulty)
    2. BperA (B-level to A-level ratio)
    3. Complexity
    4. Accuracy
    5. Fluency
    6. Logicality
    7. Sophistication
  - Total score formula: ((AvrDiff + BperA)/2 + Complexity + Accuracy + Fluency + Logicality + Sophistication) / 6 * 100
  - Bar chart visualization
  - Sentence-by-sentence corrections with track changes:
    - Original text with strikethrough for deletions (red)
    - Corrections/additions in blue
    - Comments explaining each correction
  - Personalized feedback message

#### Combined Analysis
- Unified interface for comprehensive assessment
- Integrate both vocabulary and writing analysis results
- Provide overall CEFR-J level recommendation

### 3. Data Resources
- **Vocabulary Data**: CEFR-J dictionaries (A1, A2, B1, B2) in CSV format
- **Grammar Profiles**: Level-specific grammar patterns for each CEFR-J level
- **Processing Scripts**: Perl scripts for text preprocessing and analysis

### 4. Algorithm Requirements

#### Key Metrics for Level Assessment
Based on CVLA output, the system uses 8 key indicators (6 used for final assessment):

1. **AvrDiff** - Average word difficulty (A1=1, A2=2, B1=3, B2=4, C1=5, C2=6)
2. **BperA** - Ratio of B-level to A-level content words
3. **CVV1** - Vocabulary diversity measure (unique verbs / √(total verbs × 2))
4. **AvrFreqRank** - Average frequency rank of words (excluding 3 least frequent)
5. **ARI** - Automated Readability Index: 4.71(chars/words) + 0.5(words/sentences) - 21.43
6. **VperSent** - Average verbs per sentence
7. **POStypes** - Diversity of parts of speech (not used in final assessment)
8. **LenNP** - Average length of noun phrases per sentence (not used in final assessment)

#### Processing Steps
- Implement text tokenization and POS tagging (using spaCy-like approach)
- Match words against level-specific dictionaries
- Calculate vocabulary distribution across levels with color coding:
  - A1: #32cd32 (green)
  - A2: #32cd32 bold (green bold)
  - B1: blue
  - B2: blue bold
  - C1: red
  - C2: red bold
  - NA content words: orange
  - NA others: default color
- Apply regression scoring (0-7 scale) for each metric
- Determine overall CEFR-J level based on combined metrics

### 5. User Interface
- Clean, modern design similar to existing analyzers
- Real-time validation with word count
- Clear loading states and error handling
- Sample text options for testing
- Results visualization including:
  - Color-coded input text display
  - Estimated CEFR-J level (e.g., B1.1)
  - Metrics comparison table with reference values
  - Score visualization with bar charts (0-7 scale)
  - Sub-level assessment for each metric
  - Detailed indicator descriptions

### 6. Performance Considerations
- Optimize data structures for fast lookups
- Implement caching where appropriate
- Handle rate limiting (30,000 words/day per user)
- Processing time: approximately 10-20 seconds for writing analysis
- Server restrictions: avoid special characters (full-width spaces, &, (), etc.)
- Display daily word count to users
- Ensure responsive performance on Cloudflare Workers

### 7. Required Credits
Display the following credits in README.md:

```
『CEFR-J Wordlist Version 1.6』 東京外国語大学投野由紀夫研究室. （URL: http://www.cefr-j.org/download.html より 2022 年 2 月ダウンロード）
『DiQt English-Japanese Dictionary』BooQs Inc.
```

## Implementation Plan

1. **Setup & Infrastructure**
   - Initialize React project with Vite
   - Configure React Router v7
   - Setup Cloudflare Workers deployment

2. **Data Processing**
   - Convert CSV files to optimized JSON format
   - Create indexed data structures for efficient lookups
   - Prepare grammar pattern matching rules

3. **Core Development**
   - Build text processing services
   - Implement level calculation algorithms
   - Create analyzer components
   - Integrate Gemini API

4. **UI/UX**
   - Design responsive layouts
   - Add interactive features
   - Implement results visualization

5. **Testing & Deployment**
   - Test with sample texts
   - Optimize performance
   - Deploy to Cloudflare Workers

## Notes
- Focus on accuracy of CEFR-J level assessment
- Ensure the application follows the methodologies described in the research papers
- Maintain consistency with existing analyzer interfaces while improving user experience