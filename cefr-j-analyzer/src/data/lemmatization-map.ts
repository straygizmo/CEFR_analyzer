// Lemmatization mappings for English words
// Maps inflected forms to their base forms

export const lemmatizationMap: { [key: string]: string } = {
  // Verb forms - be
  "am": "be",
  "is": "be",
  "are": "be",
  "was": "be",
  "were": "be",
  "been": "be",
  "being": "be",
  
  // Verb forms - have
  "has": "have",
  "had": "have",
  "having": "have",
  
  // Verb forms - do
  "does": "do",
  "did": "do",
  "done": "do",
  "doing": "do",
  
  // Verb forms - go
  "goes": "go",
  "went": "go",
  "gone": "go",
  "going": "go",
  
  // Common verb inflections
  "serves": "serve",
  "served": "serve",
  "serving": "serve",
  
  "makes": "make",
  "made": "make",
  "making": "make",
  
  "takes": "take",
  "took": "take",
  "taken": "take",
  "taking": "take",
  
  "gives": "give",
  "gave": "give",
  "given": "give",
  "giving": "give",
  
  "uses": "use",
  "used": "use",
  "using": "use",
  
  "finds": "find",
  "found": "find",
  "finding": "find",
  
  "thinks": "think",
  "thought": "think",
  "thinking": "think",
  
  "knows": "know",
  "knew": "know",
  "known": "know",
  "knowing": "know",
  
  "becomes": "become",
  "became": "become",
  "becoming": "become",
  
  "leaves": "leave",
  "left": "leave",
  "leaving": "leave",
  
  "means": "mean",
  "meant": "mean",
  "meaning": "mean",
  
  "keeps": "keep",
  "kept": "keep",
  "keeping": "keep",
  
  "begins": "begin",
  "began": "begin",
  "begun": "begin",
  "beginning": "begin",
  
  "seems": "seem",
  "seemed": "seem",
  "seeming": "seem",
  
  "helps": "help",
  "helped": "help",
  "helping": "help",
  
  "shows": "show",
  "showed": "show",
  "shown": "show",
  "showing": "show",
  
  "tries": "try",
  "tried": "try",
  "trying": "try",
  
  "calls": "call",
  "called": "call",
  "calling": "call",
  
  "provides": "provide",
  "provided": "provide",
  "providing": "provide",
  
  "sits": "sit",
  "sat": "sit",
  "sitting": "sit",
  
  "sets": "set",
  "setting": "set",
  
  "includes": "include",
  "included": "include",
  "including": "include",
  
  "continues": "continue",
  "continued": "continue",
  "continuing": "continue",
  
  "learns": "learn",
  "learned": "learn",
  "learnt": "learn",
  "learning": "learn",
  
  "changes": "change",
  "changed": "change",
  "changing": "change",
  
  "shapes": "shape",
  "shaped": "shape",
  "shaping": "shape",
  
  "challenges": "challenge",
  "challenged": "challenge",
  "challenging": "challenge",
  
  "writes": "write",
  "wrote": "write",
  "written": "write",
  "writing": "write",
  
  "plays": "play",
  "played": "play",
  "playing": "play",
  
  "runs": "run",
  "ran": "run",
  "running": "run",
  
  "reads": "read",
  "reading": "read",
  
  "allows": "allow",
  "allowed": "allow",
  "allowing": "allow",
  
  "meets": "meet",
  "met": "meet",
  "meeting": "meet",
  
  "leads": "lead",
  "led": "lead",
  "leading": "lead",
  
  "stands": "stand",
  "stood": "stand",
  "standing": "stand",
  
  "brings": "bring",
  "brought": "bring",
  "bringing": "bring",
  
  "happens": "happen",
  "happened": "happen",
  "happening": "happen",
  
  "carries": "carry",
  "carried": "carry",
  "carrying": "carry",
  
  "talks": "talk",
  "talked": "talk",
  "talking": "talk",
  
  "appears": "appear",
  "appeared": "appear",
  "appearing": "appear",
  
  "produces": "produce",
  "produced": "produce",
  "producing": "produce",
  
  "remains": "remain",
  "remained": "remain",
  "remaining": "remain",
  
  "suggests": "suggest",
  "suggested": "suggest",
  "suggesting": "suggest",
  
  "requires": "require",
  "required": "require",
  "requiring": "require",
  
  "reports": "report",
  "reported": "report",
  "reporting": "report",
  
  "decides": "decide",
  "decided": "decide",
  "deciding": "decide",
  
  "pulls": "pull",
  "pulled": "pull",
  "pulling": "pull",
  
  // Noun plurals
  "children": "child",
  "men": "man",
  "women": "woman",
  "people": "person",
  "teeth": "tooth",
  "feet": "foot",
  "mice": "mouse",
  "geese": "goose",
  
  // Common noun plurals
  "books": "book",
  "students": "student",
  "teachers": "teacher",
  "countries": "country",
  "companies": "company",
  "businesses": "business",
  "families": "family",
  "histories": "history",
  "stories": "story",
  "technologies": "technology",
  "opportunities": "opportunity",
  "communities": "community",
  "universities": "university",
  "difficulties": "difficulty",
  "activities": "activity",
  "responsibilities": "responsibility",
  "possibilities": "possibility",
  
  // Adjective forms
  "better": "good",
  "best": "good",
  "worse": "bad",
  "worst": "bad",
  "farther": "far",
  "further": "far",
  "farthest": "far",
  "furthest": "far",
  "larger": "large",
  "largest": "large",
  "smaller": "small",
  "smallest": "small",
  "higher": "high",
  "highest": "high",
  "lower": "low",
  "lowest": "low",
  "longer": "long",
  "longest": "long",
  "shorter": "short",
  "shortest": "short",
  "deeper": "deep",
  "deepest": "deep",
  "wider": "wide",
  "widest": "wide",
  "stronger": "strong",
  "strongest": "strong",
  "weaker": "weak",
  "weakest": "weak"
};

// Function to get lemma with fallback to the original word
export function getLemma(word: string): string {
  const lower = word.toLowerCase();
  return lemmatizationMap[lower] || lower;
}