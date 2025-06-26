import { getLemma } from '../data/lemmatization-map';
import { getWordPOS } from '../data/pos-index';
import winkNLP from 'wink-nlp';
import model from 'wink-eng-lite-web-model';

// Initialize wink-nlp with error handling
let nlp: any = null;
let its: any = null;
let winkInitialized = false;

try {
  nlp = winkNLP(model);
  its = nlp.its;
  winkInitialized = true;
  console.log('wink-nlp initialized successfully');
} catch (error) {
  console.error('Failed to initialize wink-nlp:', error);
  // Continue with fallback processing
}

export interface Token {
  word: string;
  pos: string; // part of speech
  lemma: string; // base form
}

export interface Sentence {
  text: string;
  tokens: Token[];
}

export interface ProcessedText {
  sentences: Sentence[];
  tokens: Token[];
  wordCount: number;
  sentenceCount: number;
  uniqueWords: Set<string>;
}

// Common function words for basic POS tagging
const DETERMINERS = new Set(['a', 'an', 'the', 'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her', 'its', 'our', 'their']);
const PREPOSITIONS = new Set(['in', 'on', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'under', 'over', 'near', 'across']);
const CONJUNCTIONS = new Set(['and', 'or', 'but', 'nor', 'so', 'yet', 'for', 'because', 'although', 'since', 'unless', 'while', 'if']);
const PRONOUNS = new Set(['i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'myself', 'yourself', 'himself', 'herself', 'itself', 'ourselves', 'themselves']);
const AUXILIARIES = new Set(['am', 'is', 'are', 'was', 'were', 'been', 'being', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should', 'may', 'might', 'must', 'can', 'could']);
const ADVERBS = new Set(['very', 'really', 'quite', 'just', 'almost', 'also', 'often', 'always', 'usually', 'sometimes', 'never', 'here', 'there', 'now', 'then', 'today', 'yesterday', 'tomorrow', 'soon', 'already', 'still']);

// Common verb forms to help with detection when not in vocabulary
const COMMON_VERBS = new Set(['go', 'goes', 'going', 'went', 'gone', 'make', 'makes', 'making', 'made', 'get', 'gets', 'getting', 'got', 'take', 'takes', 'taking', 'took', 'taken', 'come', 'comes', 'coming', 'came', 'see', 'sees', 'seeing', 'saw', 'seen', 'know', 'knows', 'knowing', 'knew', 'known', 'think', 'thinks', 'thinking', 'thought', 'give', 'gives', 'giving', 'gave', 'given', 'find', 'finds', 'finding', 'found', 'tell', 'tells', 'telling', 'told', 'become', 'becomes', 'becoming', 'became', 'leave', 'leaves', 'leaving', 'left', 'feel', 'feels', 'feeling', 'felt', 'bring', 'brings', 'bringing', 'brought', 'begin', 'begins', 'beginning', 'began', 'begun', 'keep', 'keeps', 'keeping', 'kept', 'hold', 'holds', 'holding', 'held', 'write', 'writes', 'writing', 'wrote', 'written', 'stand', 'stands', 'standing', 'stood', 'hear', 'hears', 'hearing', 'heard', 'let', 'lets', 'letting', 'mean', 'means', 'meaning', 'meant', 'set', 'sets', 'setting', 'meet', 'meets', 'meeting', 'met', 'run', 'runs', 'running', 'ran', 'pay', 'pays', 'paying', 'paid', 'sit', 'sits', 'sitting', 'sat', 'speak', 'speaks', 'speaking', 'spoke', 'spoken', 'serve', 'serves', 'serving', 'served', 'shape', 'shapes', 'shaping', 'shaped']);

// Common verb endings for simple detection
const VERB_ENDINGS = ['ing', 'ed', 's', 'es'];
const ADJECTIVE_ENDINGS = ['able', 'ible', 'ful', 'less', 'ous', 'ive', 'al', 'ic'];
const ADVERB_ENDINGS = ['ly'];

export function tokenize(text: string): string[] {
  // Basic tokenization - split by whitespace and punctuation
  return text
    .toLowerCase()
    .replace(/[^\w\s'-]/g, ' ') // Keep apostrophes and hyphens
    .split(/\s+/)
    .filter(word => word.length > 0);
}

export function splitSentences(text: string): string[] {
  try {
    if (!winkInitialized || !nlp) {
      throw new Error('wink-nlp not initialized');
    }
    
    // Use wink-nlp for accurate sentence segmentation
    const doc = nlp.readDoc(text);
    const sentences: string[] = [];
    
    doc.sentences().each((s) => {
      const sentenceText = s.out().trim();
      if (sentenceText.length > 0) {
        sentences.push(sentenceText);
      }
    });
    
    return sentences;
  } catch (error) {
    console.error('Error in splitSentences:', error);
    // Fallback to simple sentence splitting
    return text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  }
}

export function simplePosTagger(word: string): string {
  const lower = word.toLowerCase();
  
  // Use Penn Treebank-style tags for consistency with wink-nlp
  // Check against word lists first
  if (DETERMINERS.has(lower)) return 'DT';
  if (PREPOSITIONS.has(lower)) return 'IN';
  if (CONJUNCTIONS.has(lower)) return 'CC';
  if (PRONOUNS.has(lower)) {
    if (lower === 'i' || lower === 'you' || lower === 'we' || lower === 'they') return 'PRP';
    return 'PRP$'; // possessive pronouns
  }
  if (AUXILIARIES.has(lower)) {
    if (['can', 'could', 'may', 'might', 'must', 'shall', 'should', 'will', 'would'].includes(lower)) return 'MD';
    return 'VB'; // other auxiliaries
  }
  if (ADVERBS.has(lower)) return 'RB';
  
  // Check CEFR-J vocabulary POS data
  let posFromVocab = getWordPOS(lower);
  
  // If not found, try removing common plural endings
  if (posFromVocab.length === 0) {
    if (lower.endsWith('s') && !lower.endsWith('ss')) {
      // Try singular form
      const singular = lower.slice(0, -1);
      posFromVocab = getWordPOS(singular);
    } else if (lower.endsWith('ies')) {
      // Try converting -ies to -y (e.g., communities -> community)
      const singular = lower.slice(0, -3) + 'y';
      posFromVocab = getWordPOS(singular);
    } else if (lower.endsWith('es') && (lower.endsWith('ches') || lower.endsWith('shes') || lower.endsWith('xes') || lower.endsWith('zes'))) {
      // Try removing -es for words ending in ch, sh, x, z
      const singular = lower.slice(0, -2);
      posFromVocab = getWordPOS(singular);
    }
  }
  
  if (posFromVocab.length > 0) {
    // Map CEFR-J POS tags to Penn Treebank tags
    if (posFromVocab.includes('verb')) {
      // Try to guess verb form
      if (lower.endsWith('ing')) return 'VBG';
      if (lower.endsWith('ed')) return 'VBD';
      if (lower.endsWith('s') && !lower.endsWith('ss')) return 'VBZ';
      return 'VB';
    }
    if (posFromVocab.includes('noun')) {
      // Check for plural
      if ((lower.endsWith('s') && !lower.endsWith('ss')) || lower.endsWith('ies') || lower.endsWith('es')) return 'NNS';
      return 'NN';
    }
    if (posFromVocab.includes('adjective')) return 'JJ';
    if (posFromVocab.includes('adverb')) return 'RB';
    if (posFromVocab.includes('preposition')) return 'IN';
    if (posFromVocab.includes('conjunction')) return 'CC';
    if (posFromVocab.includes('determiner')) return 'DT';
    if (posFromVocab.includes('pronoun')) return 'PRP';
    // Default to noun
    return 'NN';
  }
  
  // Check endings as fallback
  if (ADVERB_ENDINGS.some(ending => lower.endsWith(ending))) return 'RB';
  if (ADJECTIVE_ENDINGS.some(ending => lower.endsWith(ending))) return 'JJ';
  
  // Check if it's a known common verb form
  if (COMMON_VERBS.has(lower)) {
    if (lower.endsWith('ing')) return 'VBG';
    if (lower.endsWith('ed')) return 'VBD';
    if (lower.endsWith('s') && !lower.endsWith('ss')) return 'VBZ';
    return 'VB';
  }
  
  // Default to noun (singular)
  return 'NN';
}

export function lemmatize(word: string, pos: string): string {
  // Use the lemmatization map which has comprehensive coverage
  // pos parameter kept for API compatibility but not used with dictionary approach
  return getLemma(word);
}

export function processText(text: string): ProcessedText {
  try {
    if (!winkInitialized || !nlp) {
      throw new Error('wink-nlp not initialized');
    }
    
    const doc = nlp.readDoc(text);
    const sentences = doc.sentences();
    const processedSentences: Sentence[] = [];
    const allTokens: Token[] = [];
    const uniqueWords = new Set<string>();
    
    sentences.each((s) => {
      const sentenceText = s.out();
      const tokens: Token[] = [];
      
      s.tokens().each((t) => {
        // Skip punctuation and spaces
        if (t.out(its.type) === 'word') {
          const word = t.out().toLowerCase();
          const winkPos = t.out(its.pos);
          const pos = mapWinkPosToSimple(winkPos);
          const lemma = getLemma(word) || word;
          
          const token: Token = { word, pos, lemma };
          tokens.push(token);
          allTokens.push(token);
          uniqueWords.add(lemma);
        }
      });
      
      if (tokens.length > 0) {
        processedSentences.push({ text: sentenceText, tokens });
      }
    });
    
    return {
      sentences: processedSentences,
      tokens: allTokens,
      wordCount: allTokens.length,
      sentenceCount: processedSentences.length,
      uniqueWords
    };
  } catch (error) {
    console.error('Error in processText:', error);
    // Fallback to simple processing
    const sentences = splitSentences(text);
    const processedSentences: Sentence[] = [];
    const allTokens: Token[] = [];
    const uniqueWords = new Set<string>();
    
    for (const sentenceText of sentences) {
      const words = tokenize(sentenceText);
      const tokens: Token[] = [];
      
      for (const word of words) {
        const pos = simplePosTagger(word);
        const lemma = getLemma(word) || word;
        
        const token: Token = { word, pos, lemma };
        tokens.push(token);
        allTokens.push(token);
        uniqueWords.add(lemma);
      }
      
      if (tokens.length > 0) {
        processedSentences.push({ text: sentenceText, tokens });
      }
    }
    
    return {
      sentences: processedSentences,
      tokens: allTokens,
      wordCount: allTokens.length,
      sentenceCount: processedSentences.length,
      uniqueWords
    };
  }
}

// Map wink-nlp POS tags to Penn Treebank tags for consistency
function mapWinkPosToSimple(winkPos: string): string {
  // wink-nlp uses Universal POS tags, we need to map them to Penn Treebank tags
  const mapping: { [key: string]: string } = {
    'NOUN': 'NN',
    'PROPN': 'NNP',  // Proper noun
    'VERB': 'VB',
    'AUX': 'VB',     // Auxiliary verbs (mapped to VB for consistency)
    'ADJ': 'JJ',
    'ADV': 'RB',
    'PRON': 'PRP',
    'DET': 'DT',
    'ADP': 'IN',     // Adposition (preposition)
    'CCONJ': 'CC',   // Coordinating conjunction
    'SCONJ': 'IN',   // Subordinating conjunction
    'NUM': 'CD',     // Cardinal number
    'PART': 'TO',    // Particle
    'INTJ': 'UH',    // Interjection
    'PUNCT': '.',
    'SYM': 'SYM',
    'X': 'FW'        // Other/foreign word
  };
  
  return mapping[winkPos] || winkPos || 'NN';
}

// Calculate readability metrics
export function calculateARI(text: string): number {
  try {
    if (!winkInitialized || !nlp) {
      throw new Error('wink-nlp not initialized');
    }
    
    const doc = nlp.readDoc(text);
    
    // Count characters (excluding spaces)
    const chars = text.replace(/\s/g, '').length;
    
    // Count words using wink-nlp
    let wordCount = 0;
    doc.tokens().each((t) => {
      if (t.out(its.type) === 'word') {
        wordCount++;
      }
    });
    
    // Count sentences
    const sentenceCount = doc.sentences().length();
    
    if (wordCount === 0 || sentenceCount === 0) return 0;
    
    // ARI formula: 4.71(characters/words) + 0.5(words/sentences) - 21.43
    return 4.71 * (chars / wordCount) + 0.5 * (wordCount / sentenceCount) - 21.43;
  } catch (error) {
    console.error('Error in calculateARI:', error);
    // Fallback to simple calculation
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const chars = text.replace(/\s/g, '').length;
    
    if (words.length === 0 || sentences.length === 0) return 0;
    
    return 4.71 * (chars / words.length) + 0.5 * (words.length / sentences.length) - 21.43;
  }
}

// Extract noun phrases using wink-nlp
export function extractNounPhrases(sentence: Sentence): string[][] {
  try {
    if (!winkInitialized || !nlp) {
      throw new Error('wink-nlp not initialized');
    }
    
    // Reconstruct the sentence text from tokens
    const sentenceText = sentence.tokens.map(t => t.word).join(' ');
    const doc = nlp.readDoc(sentenceText);
    const nounPhrases: string[][] = [];
    
    // Use wink-nlp's customEntities for noun phrases
    doc.customEntities().each((ce) => {
      const phrase: string[] = [];
      ce.tokens().each((token) => {
        if (token.out(its.type) === 'word') {
          phrase.push(token.out().toLowerCase());
        }
      });
      if (phrase.length > 0) {
        nounPhrases.push(phrase);
      }
    });
    
    // More comprehensive pattern-based approach for longer noun phrases
    // This follows patterns like: (DET)? (ADJ|NOUN)* NOUN (PREP (DET)? (ADJ|NOUN)* NOUN)*
    const tokens = [];
    doc.tokens().each((token) => {
      if (token.out(its.type) === 'word') {
        tokens.push({
          word: token.out().toLowerCase(),
          pos: token.out(its.pos)
        });
      }
    });
    
    let i = 0;
    while (i < tokens.length) {
      let currentPhrase: string[] = [];
      let startIdx = i;
      
      // Optional determiner
      if (tokens[i] && (tokens[i].pos === 'DET' || tokens[i].pos === 'PRON' || tokens[i].pos === 'DT' || tokens[i].pos === 'PDT' || tokens[i].pos === 'PRP$' || tokens[i].pos === 'WP$')) {
        currentPhrase.push(tokens[i].word);
        i++;
      }
      
      // Adjectives and nouns (including compound nouns)
      while (i < tokens.length && 
             (tokens[i].pos === 'ADJ' || 
              tokens[i].pos === 'NOUN' ||
              tokens[i].pos === 'PROPN' || // Proper noun
              tokens[i].pos === 'NUM' || // Numbers
              tokens[i].pos?.startsWith('JJ') || // Penn Treebank fallback
              tokens[i].pos?.startsWith('NN') ||
              tokens[i].pos === 'VBG' || // gerunds can act as modifiers
              tokens[i].pos === 'VBN' || // past participles as modifiers
              tokens[i].pos === 'CD')) { // cardinal numbers
        currentPhrase.push(tokens[i].word);
        i++;
      }
      
      // Check if we have at least one noun
      let hasNoun = false;
      for (let j = startIdx; j < i; j++) {
        if (tokens[j].pos === 'NOUN' || tokens[j].pos === 'PROPN' || tokens[j].pos?.startsWith('NN')) {
          hasNoun = true;
          break;
        }
      }
      
      if (hasNoun && currentPhrase.length > 0) {
        // Check for prepositional phrases that extend the noun phrase
        if (i < tokens.length && (tokens[i].pos === 'ADP' || tokens[i].pos === 'IN')) {
          const prepStart = i;
          currentPhrase.push(tokens[i].word); // Add preposition
          i++;
          
          // Optional determiner after preposition
          if (i < tokens.length && (tokens[i].pos === 'DET' || tokens[i].pos === 'DT' || tokens[i].pos === 'PDT')) {
            currentPhrase.push(tokens[i].word);
            i++;
          }
          
          // Adjectives and nouns after preposition
          let foundNounAfterPrep = false;
          while (i < tokens.length && 
                 (tokens[i].pos === 'ADJ' || 
                  tokens[i].pos === 'NOUN' ||
                  tokens[i].pos === 'PROPN' ||
                  tokens[i].pos === 'NUM' ||
                  tokens[i].pos?.startsWith('JJ') || 
                  tokens[i].pos?.startsWith('NN') ||
                  tokens[i].pos === 'VBG' ||
                  tokens[i].pos === 'VBN')) {
            if (tokens[i].pos === 'NOUN' || tokens[i].pos === 'PROPN' || tokens[i].pos?.startsWith('NN')) {
              foundNounAfterPrep = true;
            }
            currentPhrase.push(tokens[i].word);
            i++;
          }
          
          // If no noun found after preposition, backtrack
          if (!foundNounAfterPrep) {
            currentPhrase = currentPhrase.slice(0, prepStart - startIdx);
            i = prepStart;
          }
        }
        
        // Don't add duplicates
        const phraseStr = currentPhrase.join(' ');
        const isDuplicate = nounPhrases.some(np => np.join(' ') === phraseStr);
        if (!isDuplicate && currentPhrase.length > 0) {
          nounPhrases.push(currentPhrase);
        }
      } else {
        i = startIdx + 1;
      }
    }
    
    return nounPhrases;
  } catch (error) {
    console.error('Error in extractNounPhrases:', error);
    // Enhanced fallback approach
    const nounPhrases: string[][] = [];
    const tokens = sentence.tokens;
    
    let i = 0;
    while (i < tokens.length) {
      let currentPhrase: string[] = [];
      let startIdx = i;
      
      // Start with determiner or possessive
      if (tokens[i] && (tokens[i].pos === 'DET' || tokens[i].pos === 'PRON' || tokens[i].pos === 'DT' || tokens[i].pos?.startsWith('PRP'))) {
        currentPhrase.push(tokens[i].word);
        i++;
      }
      
      // Collect modifiers (adjectives, adverbs modifying adjectives)
      while (i < tokens.length && (tokens[i].pos === 'ADJ' || tokens[i].pos === 'ADV' || tokens[i].pos?.startsWith('JJ') || tokens[i].pos?.startsWith('RB'))) {
        currentPhrase.push(tokens[i].word);
        i++;
      }
      
      // Must have at least one noun
      let nounCount = 0;
      while (i < tokens.length && (tokens[i].pos === 'NOUN' || tokens[i].pos === 'PROPN' || tokens[i].pos?.startsWith('NN'))) {
        currentPhrase.push(tokens[i].word);
        nounCount++;
        i++;
      }
      
      if (nounCount > 0 && currentPhrase.length > 0) {
        // Check for prepositional extension
        if (i < tokens.length && (tokens[i].pos === 'ADP' || tokens[i].pos === 'PREP' || tokens[i].pos === 'IN')) {
          const tempPhrase = [...currentPhrase];
          tempPhrase.push(tokens[i].word);
          i++;
          
          // Look for noun phrase after preposition
          let prepPhraseStart = i;
          if (i < tokens.length && (tokens[i].pos === 'DET' || tokens[i].pos === 'DT')) {
            tempPhrase.push(tokens[i].word);
            i++;
          }
          
          while (i < tokens.length && (tokens[i].pos === 'ADJ' || tokens[i].pos?.startsWith('JJ'))) {
            tempPhrase.push(tokens[i].word);
            i++;
          }
          
          if (i < tokens.length && (tokens[i].pos === 'NOUN' || tokens[i].pos === 'PROPN' || tokens[i].pos?.startsWith('NN'))) {
            tempPhrase.push(tokens[i].word);
            currentPhrase = tempPhrase;
            i++;
          } else {
            // Backtrack if no noun found
            i = prepPhraseStart;
          }
        }
        
        nounPhrases.push(currentPhrase);
      } else if (currentPhrase.length === 0 && i < tokens.length && (tokens[i].pos === 'NOUN' || tokens[i].pos === 'PROPN' || tokens[i].pos?.startsWith('NN'))) {
        // Single noun
        nounPhrases.push([tokens[i].word]);
        i++;
      } else {
        i = startIdx + 1;
      }
    }
    
    return nounPhrases;
  }
}

// Count content words (nouns, verbs, adjectives, adverbs)
export function countContentWords(tokens: Token[]): { [pos: string]: number } {
  const counts: { [pos: string]: number } = {};
  
  // Check for both Penn Treebank and Universal POS tags for content words
  const isContentWord = (pos: string) => {
    if (!pos) return false;
    // Penn Treebank tags
    if (pos.startsWith('NN') || // Nouns
        pos.startsWith('VB') || // Verbs  
        pos.startsWith('JJ') || // Adjectives
        pos.startsWith('RB')) { // Adverbs
      return true;
    }
    // Universal POS tags (fallback)
    if (['NOUN', 'PROPN', 'VERB', 'AUX', 'ADJ', 'ADV'].includes(pos)) {
      return true;
    }
    return false;
  };
  
  for (const token of tokens) {
    if (isContentWord(token.pos)) {
      // Group by base POS type for counting
      let baseType = 'OTHER';
      if (token.pos?.startsWith('NN') || ['NOUN', 'PROPN'].includes(token.pos)) baseType = 'NOUN';
      else if (token.pos?.startsWith('VB') || ['VERB', 'AUX'].includes(token.pos)) baseType = 'VERB';
      else if (token.pos?.startsWith('JJ') || token.pos === 'ADJ') baseType = 'ADJ';
      else if (token.pos?.startsWith('RB') || token.pos === 'ADV') baseType = 'ADV';
      
      counts[baseType] = (counts[baseType] || 0) + 1;
    }
  }
  
  return counts;
}

// Get unique POS types count
export function getUniquePOSCount(tokens: Token[]): number {
  const uniquePOS = new Set(tokens.map(t => t.pos));
  return uniquePOS.size;
}