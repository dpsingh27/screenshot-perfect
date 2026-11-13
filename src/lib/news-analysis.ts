export type SignalKind = "misleading" | "measured";

export type NewsSignal = {
  label: string;
  kind: SignalKind;
  strength: number;
  indicators: string[];
  note: string;
};

const languageSignals: { phrase: string; kind: SignalKind; weight: number }[] = [
  { phrase: "they don't want you to know", kind: "misleading", weight: 3 },
  { phrase: "share before deleted", kind: "misleading", weight: 3 },
  { phrase: "everyone is saying", kind: "misleading", weight: 2 },
  { phrase: "mainstream media", kind: "misleading", weight: 2 },
  { phrase: "100%", kind: "misleading", weight: 2 },
  { phrase: "cover-up", kind: "misleading", weight: 2 },
  { phrase: "guaranteed", kind: "misleading", weight: 2 },
  { phrase: "shocking", kind: "misleading", weight: 1 },
  { phrase: "wake up", kind: "misleading", weight: 1 },
  { phrase: "secret", kind: "misleading", weight: 1 },
  { phrase: "exposed", kind: "misleading", weight: 1 },
  { phrase: "urgent", kind: "misleading", weight: 1 },
  { phrase: "miracle", kind: "misleading", weight: 1 },
  { phrase: "breaking", kind: "misleading", weight: 1 },
  { phrase: "according to", kind: "measured", weight: 2 },
  { phrase: "associated press", kind: "measured", weight: 3 },
  { phrase: "reuters", kind: "measured", weight: 3 },
  { phrase: "official statement", kind: "measured", weight: 2 },
  { phrase: "court records", kind: "measured", weight: 2 },
  { phrase: "published", kind: "measured", weight: 1 },
  { phrase: "research", kind: "measured", weight: 1 },
  { phrase: "study", kind: "measured", weight: 1 },
  { phrase: "data", kind: "measured", weight: 1 },
  { phrase: "report", kind: "measured", weight: 1 },
  { phrase: "source", kind: "measured", weight: 1 },
  { phrase: "records", kind: "measured", weight: 1 },
];

function phraseMatches(text: string, phrase: string): boolean {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
  return new RegExp(`\\b${escaped}\\b`, "i").test(text);
}

export function analyzeNews(text: string): NewsSignal {
  const indicators = languageSignals.filter(({ phrase }) => phraseMatches(text, phrase));
  const misleadingScore = indicators
    .filter(({ kind }) => kind === "misleading")
    .reduce((total, signal) => total + signal.weight, 0);
  const measuredScore = indicators
    .filter(({ kind }) => kind === "measured")
    .reduce((total, signal) => total + signal.weight, 0);
  const isMisleading = misleadingScore > measuredScore;
  const difference = Math.abs(misleadingScore - measuredScore);
  const strength = Math.min(92, 54 + difference * 8);

  return {
    label: isMisleading ? "More misleading-language signals" : "More measured-language signals",
    kind: isMisleading ? "misleading" : "measured",
    strength,
    indicators: indicators.map(({ phrase }) => phrase),
    note:
      indicators.length === 0
        ? "No matching language cues found. A lack of cues does not confirm that a claim is accurate."
        : "Based on wording cues only. This result does not verify the claims, source, or facts in the text.",
  };
}

export function extractCsvArticles(csv: string): string[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  const source = csv.replace(/^\uFEFF/, "");

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (character === '"' && inQuotes && source[index + 1] === '"') {
      cell += '"';
      index += 1;
    } else if (character === '"') {
      inQuotes = !inQuotes;
    } else if (character === "," && !inQuotes) {
      row.push(cell.trim());
      cell = "";
    } else if ((character === "\n" || character === "\r") && !inQuotes) {
      if (character === "\r" && source[index + 1] === "\n") index += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }

  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  if (rows.length === 0) return [];

  const headers = rows[0].map((value) => value.toLowerCase().replace(/[^a-z]/g, ""));
  const articleColumn = headers.findIndex((value) =>
    ["article", "text", "news", "headline", "content", "title"].includes(value),
  );
  const hasHeader = articleColumn !== -1;
  const selectedColumn = hasHeader ? articleColumn : 0;
  const dataRows = hasHeader ? rows.slice(1) : rows;

  return dataRows
    .map((values) => values[selectedColumn] ?? "")
    .filter((value) => value.length > 0);
}