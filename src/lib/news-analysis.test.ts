import { describe, expect, it } from "vitest";

import { analyzeNews, extractCsvArticles } from "./news-analysis";

describe("news language signals", () => {
  it("flags the sensational sample as more misleading-language signals", () => {
    expect(analyzeNews("Shocking secret cover-up exposed — share before deleted!").kind).toBe(
      "misleading",
    );
  });

  it("recognizes cited reporting as more measured-language signals", () => {
    expect(
      analyzeNews("According to Reuters, court records published today include new data.").kind,
    ).toBe("measured");
  });

  it("extracts quoted article text from a named CSV column", () => {
    expect(extractCsvArticles('headline,article\n"City report","According to Reuters, ""new data"" was published."')).toEqual(
      ['According to Reuters, "new data" was published.'],
    );
  });
});