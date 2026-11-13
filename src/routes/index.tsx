import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
  CircleHelp,
  FileSpreadsheet,
  FileText,
  FlaskConical,
  Gauge,
  Info,
  LoaderCircle,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { analyzeNews, extractCsvArticles, type NewsSignal } from "@/lib/news-analysis";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Signal Check — News language analysis" },
      {
        name: "description",
        content:
          "Explore language signals in a headline or article with a transparent news-analysis demo.",
      },
      { property: "og:title", content: "Signal Check — News language analysis" },
      {
        property: "og:description",
        content: "Check language cues, inspect CSV samples, and explore the analysis method.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NewsChecker,
});

const sampleTexts = {
  measured:
    "According to Reuters, published court records include the official statement and new data from the research team.",
  sensational:
    "Shocking secret cover-up exposed! They don't want you to know this — share before deleted!",
};

type BatchItem = { text: string; result: NewsSignal };

function NewsChecker() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<NewsSignal | null>(null);
  const [activeView, setActiveView] = useState<"check" | "method">("check");
  const [batch, setBatch] = useState<BatchItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fileMessage, setFileMessage] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  function runCheck(value = text) {
    if (!value.trim() || isAnalyzing) return;
    setText(value);
    setIsAnalyzing(true);
    window.setTimeout(() => {
      setResult(analyzeNews(value));
      setIsAnalyzing(false);
    }, 480);
  }

  async function readCsv(file: File | undefined) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setFileMessage("Choose a .csv file to run a batch check.");
      return;
    }
    try {
      const articles = extractCsvArticles(await file.text()).slice(0, 50);
      setBatch(articles.map((article) => ({ text: article, result: analyzeNews(article) })));
      setFileMessage(
        articles.length
          ? `${articles.length} ${articles.length === 1 ? "row" : "rows"} checked${articles.length === 50 ? " (50-row preview limit)" : ""}.`
          : "No article text found. Add a text, article, headline, or content column.",
      );
    } catch {
      setFileMessage("This CSV could not be read. Try saving it as a UTF-8 CSV file.");
      setBatch([]);
    }
  }

  const characterCount = text.length;

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand-lockup" href="#top" aria-label="Signal Check home">
          <span className="brand-mark"><span /></span>
          <span className="brand-name">signal<span>check</span></span>
        </a>
        <div className="topbar-right">
          <span className="status-dot" />
          <span className="topbar-status">LANGUAGE ANALYSIS DEMO</span>
          <span className="topbar-divider" />
          <span className="edition-label">MCA · 2026</span>
        </div>
      </header>

      <main id="top" className="main-content">
        <div className="intro-row">
          <div>
            <div className="eyebrow"><span className="eyebrow-line" /> OPEN SOURCE INTELLIGENCE <span className="eyebrow-code">/ 001</span></div>
            <h1>Read between<br className="mobile-break" /> the <span>headlines.</span></h1>
            <p className="intro-copy">A closer look at the language behind the news.</p>
          </div>
          <div className="intro-note">
            <ShieldCheck size={18} strokeWidth={1.6} />
            <span>Words are signals.<br />Not proof.</span>
          </div>
        </div>

        <nav className="view-tabs" aria-label="Dashboard sections">
          <Button
            type="button"
            variant="ghost"
            className={`view-tab ${activeView === "check" ? "is-active" : ""}`}
            onClick={() => setActiveView("check")}
          >
            <FileText size={16} /> Single check <span className="tab-number">01</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            className={`view-tab ${activeView === "method" ? "is-active" : ""}`}
            onClick={() => setActiveView("method")}
          >
            <BarChart3 size={16} /> Model notes <span className="tab-number">02</span>
          </Button>
          <span className="tab-end-note"><span className="status-dot" /> MODEL OVERVIEW</span>
        </nav>

        {activeView === "check" ? (
          <>
            <section className="workspace" aria-label="News analysis workspace">
              <div className="workspace-main">
                <div className="section-kicker"><span>01</span> / INPUT</div>
                <div className="input-heading-row">
                  <h2>What are we looking at?</h2>
                  <span className="input-hint"><CircleHelp size={14} /> Headline or article</span>
                </div>
                <Textarea
                  className="news-input"
                  value={text}
                  onChange={(event) => setText(event.target.value.slice(0, 5000))}
                  placeholder="Paste a headline or a passage from an article…"
                  aria-label="News headline or article text"
                  maxLength={5000}
                />
                <div className="input-meta">
                  <span>TEXT INPUT <span className="meta-separator">·</span> UP TO 5,000 CHARACTERS</span>
                  <span className={characterCount > 4500 ? "count-near-limit" : ""}>{characterCount.toLocaleString()} / 5,000</span>
                </div>
                <div className="sample-row">
                  <span className="sample-label">TRY A SAMPLE</span>
                  <Button type="button" variant="outline" size="sm" className="sample-button" onClick={() => { setText(sampleTexts.measured); setResult(null); }}>
                    <Check size={14} /> Measured language
                  </Button>
                  <Button type="button" variant="outline" size="sm" className="sample-button" onClick={() => { setText(sampleTexts.sensational); setResult(null); }}>
                    <AlertTriangle size={14} /> Sensational language
                  </Button>
                </div>
                <div className="analyze-row">
                  <Button type="button" className="analyze-button" onClick={() => runCheck()} disabled={!text.trim() || isAnalyzing}>
                    {isAnalyzing ? <LoaderCircle size={17} className="spin" /> : <Sparkles size={17} />}
                    {isAnalyzing ? "Reading language…" : "Analyze language"}
                    {!isAnalyzing && <ArrowRight size={16} />}
                  </Button>
                  {result && !isAnalyzing && (
                    <Button type="button" variant="ghost" size="sm" className="reset-button" onClick={() => { setResult(null); setText(""); }} aria-label="Clear analysis">
                      <RotateCcw size={15} /> Clear
                    </Button>
                  )}
                </div>
              </div>

              <div className="workspace-aside">
                <div className="section-kicker"><span>02</span> / RESULT</div>
                {result ? (
                  <ResultPanel result={result} />
                ) : (
                  <div className="empty-result">
                    <div className="empty-icon"><Gauge size={23} strokeWidth={1.4} /></div>
                    <h3>Waiting for a signal</h3>
                    <p>Your language cues will appear here after analysis.</p>
                    <div className="empty-rule"><span /><span /><span /></div>
                    <span className="empty-footnote">ANALYSIS OUTPUT <span>— —</span></span>
                  </div>
                )}
              </div>
            </section>

            <section className="batch-section" aria-labelledby="batch-title">
              <div className="batch-heading">
                <div>
                  <div className="section-kicker"><span>03</span> / BATCH CHECK</div>
                  <h2 id="batch-title">More than one story?</h2>
                  <p>Check text from a CSV file, up to 50 rows per upload.</p>
                </div>
                <div className="batch-actions">
                  <input ref={fileInput} className="visually-hidden" type="file" accept=".csv,text/csv" aria-label="Choose CSV file" onChange={(event) => { void readCsv(event.target.files?.[0]); event.currentTarget.value = ""; }} />
                  <Button type="button" variant="outline" className="upload-button" onClick={() => fileInput.current?.click()}>
                    <Upload size={16} /> Upload CSV <ChevronRight size={15} />
                  </Button>
                  <span className="csv-hint"><FileSpreadsheet size={13} /> CSV · UTF-8</span>
                </div>
              </div>
              {fileMessage ? <p className="file-message" role="status">{fileMessage}</p> : null}
              {batch.length > 0 ? (
                <div className="batch-table-wrap">
                  <table className="batch-table">
                    <thead><tr><th>#</th><th>ARTICLE TEXT</th><th>LANGUAGE SIGNAL</th><th>STRENGTH</th></tr></thead>
                    <tbody>{batch.map((item, index) => <tr key={`${index}-${item.text.slice(0, 30)}`}>
                      <td className="table-index">{String(index + 1).padStart(2, "0")}</td>
                      <td className="table-article">{item.text}</td>
                      <td><span className={`signal-pill ${item.result.kind}`}>{item.result.kind === "misleading" ? <AlertTriangle size={12} /> : <Check size={12} />}{item.result.label}</span></td>
                      <td className="table-strength">{item.result.strength}%</td>
                    </tr>)}</tbody>
                  </table>
                  <p className="batch-disclaimer"><Info size={13} /> Language cues only — not a fact-check or machine-learning prediction.</p>
                </div>
              ) : (
                <div className="upload-strip">
                  <div className="upload-strip-icon"><FileSpreadsheet size={20} strokeWidth={1.5} /></div>
                  <div className="upload-strip-text"><strong>Drop a CSV to explore multiple texts</strong><span>We look for a column named text, article, headline, title, or content.</span></div>
                  <span className="upload-strip-format">.CSV</span>
                </div>
              )}
            </section>
          </>
        ) : (
          <MethodPanel />
        )}

        <section className="caution-strip" aria-label="Analysis limitation">
          <Info size={17} />
          <p><strong>Important context</strong><span>This browser demo flags selected wording patterns. It does not verify claims, identify a source, or determine whether a story is true or false.</span></p>
          <span className="caution-code">LIMITATION / 01</span>
        </section>
      </main>

      <footer className="site-footer">
        <a className="footer-brand" href="#top"><span className="brand-mark small"><span /></span> signalcheck</a>
        <span className="footer-credit">Developed by Divya Pratap Singh. For MCA Minor Project.</span>
        <span className="footer-tag">BUILT TO QUESTION <span>·</span> 2026</span>
      </footer>
    </div>
  );
}

function ResultPanel({ result }: { result: NewsSignal }) {
  const isMisleading = result.kind === "misleading";
  return (
    <div className={`result-panel ${result.kind}`} aria-live="polite">
      <div className="result-label-row">
        <span className={`result-symbol ${result.kind}`}>{isMisleading ? <AlertTriangle size={17} /> : <Check size={17} />}</span>
        <span className="result-type">LANGUAGE PATTERN</span>
        <span className="result-live"><span /> COMPLETE</span>
      </div>
      <h3>{result.label}</h3>
      <p className="result-summary">{isMisleading ? "The wording includes cues often used in sensational or manipulative claims." : "The wording includes cues commonly seen in measured, attributed reporting."}</p>
      <div className="strength-row"><span>RELATIVE SIGNAL STRENGTH</span><strong>{result.strength}<small>%</small></strong></div>
      <div className="meter-track" role="meter" aria-label="Relative language signal strength" aria-valuenow={result.strength} aria-valuemin={0} aria-valuemax={100}><span className={`meter-fill ${result.kind}`} style={{ width: `${result.strength}%` }} /></div>
      <div className="meter-scale"><span>LOW</span><span>HIGH</span></div>
      <div className="indicator-block">
        <span className="indicator-title">MATCHED CUES <span>{result.indicators.length.toString().padStart(2, "0")}</span></span>
        {result.indicators.length > 0 ? <div className="indicator-tags">{result.indicators.map((indicator) => <span className={`indicator-tag ${result.kind}`} key={indicator}>{indicator}</span>)}</div> : <span className="no-cues">No preset cues matched.</span>}
      </div>
      <div className="result-note"><Info size={14} />{result.note}</div>
    </div>
  );
}

function MethodPanel() {
  return (
    <section className="method-view" aria-label="Model overview and methodology">
      <div className="section-kicker"><span>04</span> / HOW TO READ THIS</div>
      <div className="method-heading"><h2>Signals, not verdicts.</h2><p>This educational prototype matches a small set of phrase cues directly in your browser. It does not use a trained classifier or external news dataset.</p></div>
      <div className="method-grid">
        <article className="method-card"><span className="method-icon"><FlaskConical size={19} /></span><span className="method-step">01 / INPUT</span><h3>Plain text in</h3><p>A headline or excerpt stays in this page. The demo scans only the text you provide.</p></article>
        <article className="method-card"><span className="method-icon"><FileText size={19} /></span><span className="method-step">02 / MATCH</span><h3>Phrase cues</h3><p>A short, visible phrase list highlights some sensational or attributed-language patterns.</p></article>
        <article className="method-card"><span className="method-icon"><BarChart3 size={19} /></span><span className="method-step">03 / SUMMARY</span><h3>Relative strength</h3><p>A simple rule-based comparison summarizes matched cues. It is not a probability or model confidence.</p></article>
      </div>
      <div className="metrics-heading"><div><div className="section-kicker"><span>05</span> / PROJECT BRIEF</div><h3>About model performance</h3></div><span className="metrics-caption">REFERENCE, NOT BENCHMARK</span></div>
      <div className="metrics-strip"><div className="metric-item"><span className="metric-value">TF–IDF</span><span className="metric-name">Brief's proposed text features</span></div><div className="metric-item"><span className="metric-value">Logistic regression</span><span className="metric-name">Brief's proposed classifier</span></div><div className="metric-item"><span className="metric-value">94.5%</span><span className="metric-name">Illustrative accuracy mentioned in brief</span></div><div className="metric-item"><span className="metric-value metric-not-run"><X size={15} /> Not evaluated</span><span className="metric-name">No trained model or test set is connected</span></div></div>
      <div className="method-warning"><AlertTriangle size={16} /><span>Numbers above are project-brief context only. This demo has no training data, confusion matrix, or measured evaluation results.</span></div>
    </section>
  );
}