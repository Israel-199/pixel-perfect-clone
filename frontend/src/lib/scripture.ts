export interface ParsedScripture {
  verse: string;
  text: string;
}

export function parseScripture(raw?: string | null): ParsedScripture {
  const fallback: ParsedScripture = {
    verse: "ዮሐንስ 13:13",
    text: "እናንተ መምህር ጌታም ትሉኛላችሁ፤ እንዲሁም ነኝና መልካም ትላላችሁ።",
  };

  if (!raw || !raw.trim()) {
    return fallback;
  }

  const clean = raw.trim();

  // Helper to remove enclosing single/double/Ethiopian quotes and extra whitespace
  const stripQuotes = (s: string | undefined): string => {
    if (!s) return "";
    return s.replace(/^['"“«‘\s]+|['"”»’\s]+$/g, "").trim();
  };

  // Split into lines in case the user pasted a multi-line article snippet
  const lines: string[] = clean.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    // 1. Matches: "Book Chapter:Verse — 'Text...'" (with em-dash, en-dash, hyphen, or colon)
    const matchPrefix = line.match(
      /^([1-3]?\s*[\u1200-\u137F\w\s]+?\s+\d+:\d+(?:[-–]\d+)?)\s*(?:—|–|-|:|፤)\s*(.+)$/
    );
    if (matchPrefix && matchPrefix[1] && matchPrefix[2]) {
      const verse = matchPrefix[1].trim();
      const text = stripQuotes(matchPrefix[2]);
      if (verse && text) {
        return { verse, text };
      }
    }

    // 2. Matches: line containing Bible verse pattern anywhere followed by dash and text
    const matchAnywhere = line.match(
      /([1-3]?\s*[\u1200-\u137F\w]+(?:\s+[\u1200-\u137F\w]+)?\s+\d+:\d+(?:[-–]\d+)?)\s*(?:—|–|-|:|፤)\s*['"“«‘]?(.*?)['"”»’]?$/
    );
    if (matchAnywhere && matchAnywhere[1] && matchAnywhere[2]) {
      const verse = matchAnywhere[1].trim();
      const text = stripQuotes(matchAnywhere[2]);
      if (verse && text) {
        return { verse, text };
      }
    }

    // 3. Matches: "'Text...' (Book Chapter:Verse)" or "Text... — Book Chapter:Verse"
    const matchSuffix = line.match(
      /^(.*?)\s*(?:[(—–-])\s*([1-3]?\s*[\u1200-\u137F\w\s]+?\s+\d+:\d+(?:[-–]\d+)?)\s*\)?$/
    );
    if (matchSuffix && matchSuffix[1] && matchSuffix[2]) {
      const text = stripQuotes(matchSuffix[1]);
      const verse = matchSuffix[2].trim();
      if (verse && text) {
        return { verse, text };
      }
    }
  }

  // 4. If reference is on one line and the verse text is on the following line
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (!l) continue;
    const refMatch = l.match(/^([1-3]?\s*[\u1200-\u137F\w\s]+?\s+\d+:\d+(?:[-–]\d+)?)$/);
    if (refMatch && refMatch[1] && lines[i + 1]) {
      return {
        verse: refMatch[1].trim(),
        text: stripQuotes(lines[i + 1]),
      };
    }
  }

  // 5. Look for any line that contains an explicit quote
  const quoteMatch = clean.match(/['"“«‘]([^'"”»’]{5,})['"”»’]/);
  if (quoteMatch && quoteMatch[1]) {
    return {
      verse: "የዛሬ ቃል",
      text: stripQuotes(quoteMatch[1]),
    };
  }

  return {
    verse: "የዛሬ ቃል",
    text: stripQuotes(clean),
  };
}
