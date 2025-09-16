const ARTICLES = new Set(['a','an','the']);

export function normalize(s: string): string {
  const noDiacritics = s.normalize('NFKD').replace(/\p{Diacritic}/gu, '');
  const cleaned = noDiacritics
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ') // drop punctuation
    .replace(/\s+/g, ' ')
    .trim();
  const parts = cleaned.split(' ');
  if (parts.length && parts[0] && ARTICLES.has(parts[0])) parts.shift();
  return singularize(parts.join(' '));
}

function singularize(s: string): string {
  // handle common irregular plurals first
  const irregulars: Record<string, string> = {
    'children': 'child', 'people': 'person', 'men': 'man', 'women': 'woman',
    'feet': 'foot', 'teeth': 'tooth', 'mice': 'mouse', 'geese': 'goose'
  };
  
  return s.split(' ').map(word => {
    if (irregulars[word]) return irregulars[word];
    
    // handle regular plural patterns
    return word
      .replace(/\b(\w+?)ies\b/g, (_, x) => x + 'y')    // cities -> city
      .replace(/\b(\w+?)ves\b/g, (_, x) => x + 'f')    // wolves -> wolf
      .replace(/\b(\w+?)(ss|sh|ch|x|z)es\b/g, '$1$2')  // glasses -> glass
      .replace(/\b(\w+?)oes\b/g, (_, x) => x + 'o')    // heroes -> hero
      .replace(/\b(\w+?)s\b/g, (_, x) => x);           // cats -> cat
  }).join(' ');
}

// removed fuzzy matching - spelling must be correct

export function gradeAnswer(userInput: string, canonical: string, aliases: string[] = []) {
  const guess = normalize(userInput);
  const target = normalize(canonical);
  const all = [target, ...aliases.map(normalize)];

  if (all.includes(guess)) return { correct: true, reason: 'exact' } as const;

  // token set overlap (e.g., "police car" ~ "car") - but require substantial overlap
  const gset = new Set(guess.split(' ').filter(w => w.length > 2)); // ignore short words like "a", "of"
  for (const t of all) {
    const tset = new Set(t.split(' ').filter(w => w.length > 2));
    const inter = [...gset].filter(x => tset.has(x)).length;
    const minSize = Math.min(gset.size, tset.size);
    // require at least 50% overlap and at least 1 meaningful word match
    if (inter > 0 && inter >= Math.max(1, Math.ceil(minSize * 0.5))) {
      return { correct: true, reason: 'tokens' } as const;
    }
  }

  return { correct: false } as const;
}
