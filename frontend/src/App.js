import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';

const SAMPLE_DESCRIPTION = "I am a 42-year-old woman, diagnosed with stage 2 breast cancer six months ago. I'm currently taking tamoxifen and am allergic to sulfa drugs. I live in Phoenix, Arizona.";

const styles = {
  root: {
    minHeight: '100vh',
    backgroundColor: '#f0f4f8',
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    color: '#1a202c',
  },
  header: {
    backgroundColor: '#1a5276',
    padding: '20px 32px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
  headerInner: {
    maxWidth: 1100,
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    fontSize: 28,
  },
  headerTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
    color: '#fff',
    letterSpacing: '-0.3px',
  },
  headerSub: {
    margin: 0,
    fontSize: 13,
    color: '#a9cce3',
    marginTop: 2,
  },
  main: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '32px 16px',
  },
  searchCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: '28px 32px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    marginBottom: 28,
  },
  searchTitle: {
    margin: '0 0 20px',
    fontSize: 16,
    fontWeight: 600,
    color: '#2d3748',
  },
  form: {
    display: 'flex',
    gap: 16,
    flexWrap: 'wrap',
    alignItems: 'flex-end',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    flex: '1 1 180px',
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: '#718096',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  input: {
    padding: '10px 14px',
    border: '1.5px solid #e2e8f0',
    borderRadius: 8,
    fontSize: 15,
    outline: 'none',
    transition: 'border-color 0.15s',
    backgroundColor: '#f7fafc',
  },
  button: {
    padding: '10px 28px',
    backgroundColor: '#1a5276',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    alignSelf: 'flex-end',
    transition: 'background-color 0.15s',
    whiteSpace: 'nowrap',
  },
  resultsHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 14,
    color: '#4a5568',
    fontWeight: 500,
  },
  resultsCountNum: {
    fontWeight: 700,
    color: '#1a5276',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: '22px 26px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
    marginBottom: 16,
    borderLeft: '4px solid #1a5276',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    flexWrap: 'wrap',
  },
  cardTitle: {
    margin: '0 0 10px',
    fontSize: 16,
    fontWeight: 600,
    color: '#1a202c',
    lineHeight: 1.4,
    flex: 1,
  },
  badge: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    backgroundColor: '#c6f6d5',
    color: '#22543d',
    whiteSpace: 'nowrap',
  },
  cardMeta: {
    display: 'flex',
    gap: 20,
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  metaItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: '#a0aec0',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  metaValue: {
    fontSize: 13,
    color: '#2d3748',
    fontWeight: 500,
  },
  scoreBar: {
    marginBottom: 14,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 4,
    display: 'flex',
    justifyContent: 'space-between',
  },
  scoreTrack: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  scoreFill: (pct) => ({
    height: '100%',
    width: `${pct}%`,
    backgroundColor: pct >= 70 ? '#38a169' : pct >= 40 ? '#d69e2e' : '#e53e3e',
    borderRadius: 3,
    transition: 'width 0.4s ease',
  }),
  detailsButton: {
    padding: '7px 18px',
    backgroundColor: 'transparent',
    color: '#1a5276',
    border: '1.5px solid #1a5276',
    borderRadius: 7,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  detailsBox: {
    marginTop: 18,
    paddingTop: 18,
    borderTop: '1px solid #e2e8f0',
  },
  detailsSection: {
    marginBottom: 14,
  },
  detailsSectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#718096',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: 6,
  },
  detailsText: {
    fontSize: 13,
    color: '#2d3748',
    lineHeight: 1.7,
    whiteSpace: 'pre-wrap',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#a0aec0',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#718096',
    margin: '0 0 8px',
  },
  emptyText: {
    fontSize: 14,
    margin: 0,
  },
  loadingWrap: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#718096',
  },
  spinner: {
    display: 'inline-block',
    width: 36,
    height: 36,
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #1a5276',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    marginBottom: 14,
  },
  // Smart Match styles
  tabBar: {
    display: 'flex',
    gap: 0,
    marginBottom: 24,
    borderBottom: '2px solid #e2e8f0',
  },
  tab: (active) => ({
    padding: '12px 24px',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: active ? '3px solid #1a5276' : '3px solid transparent',
    marginBottom: '-2px',
    fontSize: 15,
    fontWeight: active ? 700 : 500,
    color: active ? '#1a5276' : '#718096',
    cursor: 'pointer',
    transition: 'all 0.15s',
  }),
  textarea: {
    padding: '14px 16px',
    border: '1.5px solid #e2e8f0',
    borderRadius: 8,
    fontSize: 15,
    outline: 'none',
    backgroundColor: '#f7fafc',
    minHeight: 110,
    fontFamily: 'inherit',
    resize: 'vertical',
    width: '100%',
    boxSizing: 'border-box',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: (color) => ({
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: '16px',
    borderLeft: `4px solid ${color}`,
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
  }),
  summaryNum: {
    fontSize: 28,
    fontWeight: 700,
    color: '#1a202c',
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: '#718096',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  filterBar: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  filterButton: (active) => ({
    padding: '6px 14px',
    borderRadius: 20,
    border: 'none',
    backgroundColor: active ? '#1a5276' : '#e2e8f0',
    color: active ? '#fff' : '#4a5568',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  }),
  statusBadge: (status) => ({
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    backgroundColor:
      status === 'qualified' ? '#c6f6d5' :
      status === 'likely_qualified' ? '#fefcbf' :
      status === 'unknown' ? '#e2e8f0' :
      '#fed7d7',
    color:
      status === 'qualified' ? '#22543d' :
      status === 'likely_qualified' ? '#744210' :
      status === 'unknown' ? '#4a5568' :
      '#742a2a',
  }),
  reasonItem: {
    padding: '8px 12px',
    backgroundColor: '#f7fafc',
    borderRadius: 6,
    fontSize: 13,
    color: '#2d3748',
    marginBottom: 6,
    borderLeft: '3px solid #cbd5e0',
    lineHeight: 1.5,
  },
  matchedChip: {
    display: 'inline-block',
    padding: '3px 10px',
    backgroundColor: '#bee3f8',
    color: '#2c5282',
    borderRadius: 12,
    fontSize: 11,
    fontWeight: 600,
    marginRight: 6,
    marginBottom: 4,
  },
  profileCard: {
    backgroundColor: '#edf2f7',
    borderRadius: 8,
    padding: '14px 18px',
    marginBottom: 20,
    fontSize: 13,
    color: '#2d3748',
  },
  profileLabel: {
    fontWeight: 700,
    marginRight: 6,
  },
};

function TrialCard({ trial }) {
  const [expanded, setExpanded] = useState(false);

  const location = [trial.location_city, trial.location_state, trial.location_country]
    .filter(Boolean)
    .join(', ') || 'Not specified';

  const score = trial.relevance_score ?? 0;
  const scorePct = Math.min(Math.round((score / 100) * 100), 100);

  return (
    <div style={styles.card}>
      <div style={styles.cardTop}>
        <h3 style={styles.cardTitle}>{trial.title || 'Untitled Trial'}</h3>
        <span style={styles.badge}>{trial.status || 'RECRUITING'}</span>
      </div>

      <div style={styles.cardMeta}>
        <div style={styles.metaItem}>
          <span style={styles.metaLabel}>Condition</span>
          <span style={styles.metaValue}>{trial.condition || '—'}</span>
        </div>
        <div style={styles.metaItem}>
          <span style={styles.metaLabel}>Phase</span>
          <span style={styles.metaValue}>{trial.phase || '—'}</span>
        </div>
        <div style={styles.metaItem}>
          <span style={styles.metaLabel}>Location</span>
          <span style={styles.metaValue}>{location}</span>
        </div>
        <div style={styles.metaItem}>
          <span style={styles.metaLabel}>Sponsor</span>
          <span style={styles.metaValue}>{trial.sponsor || '—'}</span>
        </div>
        <div style={styles.metaItem}>
          <span style={styles.metaLabel}>Age Range</span>
          <span style={styles.metaValue}>
            {[trial.min_age, trial.max_age].filter(Boolean).join(' – ') || '—'}
          </span>
        </div>
        <div style={styles.metaItem}>
          <span style={styles.metaLabel}>NCT ID</span>
          <span style={styles.metaValue}>{trial.nct_id}</span>
        </div>
      </div>

      <div style={styles.scoreBar}>
        <div style={styles.scoreLabel}>
          <span>Relevance Score</span>
          <span style={{ fontWeight: 600 }}>{scorePct}%</span>
        </div>
        <div style={styles.scoreTrack}>
          <div style={styles.scoreFill(scorePct)} />
        </div>
      </div>

      <button
        style={styles.detailsButton}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? 'Hide Details' : 'View Details'}
      </button>

      {expanded && (
        <div style={styles.detailsBox}>
          {trial.description && (
            <div style={styles.detailsSection}>
              <div style={styles.detailsSectionTitle}>Description</div>
              <p style={styles.detailsText}>{trial.description}</p>
            </div>
          )}
          {trial.eligibility_criteria && (
            <div style={styles.detailsSection}>
              <div style={styles.detailsSectionTitle}>Eligibility Criteria</div>
              <p style={styles.detailsText}>{trial.eligibility_criteria}</p>
            </div>
          )}
          {trial.last_updated && (
            <div style={styles.detailsSection}>
              <div style={styles.detailsSectionTitle}>Last Updated</div>
              <p style={{ ...styles.detailsText, margin: 0 }}>{trial.last_updated}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MatchedTrialCard({ result }) {
  const [expanded, setExpanded] = useState(false);

  const trial = result.trial || {};
  const score = result.score ?? 0;
  const scorePct = Math.min(Math.round(score), 100);
  const status = result.status || 'unknown';

  const location = [trial.location_city, trial.location_state, trial.location_country]
    .filter(Boolean)
    .join(', ') || 'Not specified';

  const borderColor =
    status === 'qualified' ? '#38a169' :
    status === 'likely_qualified' ? '#d69e2e' :
    status === 'unknown' ? '#a0aec0' :
    '#e53e3e';

  const cardStyle = { ...styles.card, borderLeft: `4px solid ${borderColor}` };

  return (
    <div style={cardStyle}>
      <div style={styles.cardTop}>
        <h3 style={styles.cardTitle}>{trial.title || 'Untitled Trial'}</h3>
        <span style={styles.statusBadge(status)}>{status.replace('_', ' ')}</span>
      </div>

      <div style={styles.scoreBar}>
        <div style={styles.scoreLabel}>
          <span>Match Score</span>
          <span style={{ fontWeight: 600 }}>{scorePct}/100</span>
        </div>
        <div style={styles.scoreTrack}>
          <div style={styles.scoreFill(scorePct)} />
        </div>
      </div>

      {result.matched_conditions && result.matched_conditions.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          {result.matched_conditions.map((c, i) => (
            <span key={i} style={styles.matchedChip}>{c}</span>
          ))}
        </div>
      )}

      {result.reasons && result.reasons.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          {result.reasons.map((r, i) => (
            <div key={i} style={styles.reasonItem}>{r}</div>
          ))}
        </div>
      )}

      <div style={styles.cardMeta}>
        <div style={styles.metaItem}>
          <span style={styles.metaLabel}>NCT ID</span>
          <span style={styles.metaValue}>{trial.nct_id || '—'}</span>
        </div>
        <div style={styles.metaItem}>
          <span style={styles.metaLabel}>Condition</span>
          <span style={styles.metaValue}>{trial.condition || '—'}</span>
        </div>
        <div style={styles.metaItem}>
          <span style={styles.metaLabel}>Phase</span>
          <span style={styles.metaValue}>{trial.phase || '—'}</span>
        </div>
        <div style={styles.metaItem}>
          <span style={styles.metaLabel}>Sponsor</span>
          <span style={styles.metaValue}>{trial.sponsor || '—'}</span>
        </div>
        <div style={styles.metaItem}>
          <span style={styles.metaLabel}>Location</span>
          <span style={styles.metaValue}>{location}</span>
        </div>
      </div>

      <button
        style={styles.detailsButton}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? 'Hide Trial Details' : 'View Trial Details'}
      </button>

      {expanded && (
        <div style={styles.detailsBox}>
          {trial.description && (
            <div style={styles.detailsSection}>
              <div style={styles.detailsSectionTitle}>Description</div>
              <p style={styles.detailsText}>{trial.description}</p>
            </div>
          )}
          {trial.eligibility_criteria && (
            <div style={styles.detailsSection}>
              <div style={styles.detailsSectionTitle}>Eligibility Criteria</div>
              <p style={styles.detailsText}>{trial.eligibility_criteria}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function App() {
  // Classic search state
  const [condition, setCondition] = useState('');
  const [location, setLocation] = useState('');
  const [age, setAge] = useState('');
  const [trials, setTrials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);

  // Smart match state
  const [mode, setMode] = useState('smart');
  const [description, setDescription] = useState('');
  const [matchData, setMatchData] = useState(null);
  const [statusFilter, setStatusFilter] = useState('qualifying');
  const [matching, setMatching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSearched(true);

    const params = {};
    if (condition.trim()) params.condition = condition.trim();
    if (location.trim()) params.location = location.trim();
    if (age.trim()) params.age = age.trim();

    try {
      const res = await axios.get(`${API_BASE}/api/trials`, { params });
      setTrials(res.data.trials || []);
    } catch (err) {
      setError('Failed to fetch trials. Make sure the backend is running.');
      setTrials([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMatch = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please describe your profile before searching.');
      return;
    }
    setMatching(true);
    setError(null);
    try {
      const res = await axios.post(
        `${API_BASE}/api/match`,
        { description: description.trim() },
        { params: { limit: 50 } }
      );
      setMatchData(res.data);
      setMatching(false);
    } catch (err) {
      setError('Failed to run AI match. Make sure the backend is running.');
      setMatching(false);
      setMatchData(null);
    }
  };

  const getFilteredResults = () => {
    if (!matchData || !matchData.results) return [];
    const all = matchData.results;
    if (statusFilter === 'all') return all;
    if (statusFilter === 'qualifying') return all.filter(r => ['qualified', 'likely_qualified', 'unknown'].includes(r.status));
    return all.filter(r => r.status === statusFilter);
  };

  const filteredResults = getFilteredResults();

  const renderProfile = () => {
    if (!matchData || !matchData.patient_profile) return null;
    const p = matchData.patient_profile;
    const parts = [];
    if (p.age) parts.push(`${p.age} years old`);
    if (p.sex) parts.push(p.sex);
    if (p.conditions && p.conditions.length > 0) parts.push(`conditions: ${p.conditions.join(', ')}`);
    if (p.medications && p.medications.length > 0) parts.push(`medications: ${p.medications.join(', ')}`);
    if (p.allergies && p.allergies.length > 0) parts.push(`allergies: ${p.allergies.join(', ')}`);
    const locParts = p.location ? [p.location.city, p.location.state, p.location.country].filter(Boolean) : [];
    if (locParts.length > 0) parts.push(`location: ${locParts.join(', ')}`);
    return (
      <div style={styles.profileCard}>
        <span style={styles.profileLabel}>Profile:</span>
        {parts.length > 0 ? parts.join(' · ') : 'Could not parse profile details.'}
      </div>
    );
  };

  const summary = matchData && matchData.summary ? matchData.summary : {};

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus { border-color: #1a5276 !important; background: #fff !important; }
        textarea:focus { border-color: #1a5276 !important; background: #fff !important; }
        button:hover { opacity: 0.88; }
      `}</style>

      <div style={styles.root}>
        <header style={styles.header}>
          <div style={styles.headerInner}>
            <span style={styles.headerIcon}>🏥</span>
            <div>
              <h1 style={styles.headerTitle}>Clinical Trial Matcher</h1>
              <p style={styles.headerSub}>Smart eligibility matching powered by AI</p>
            </div>
          </div>
        </header>

        <main style={styles.main}>
          {/* Tab bar */}
          <div style={styles.tabBar}>
            <button style={styles.tab(mode === 'smart')} onClick={() => setMode('smart')}>
              Smart Match (AI)
            </button>
            <button style={styles.tab(mode === 'classic')} onClick={() => setMode('classic')}>
              Classic Search
            </button>
          </div>

          {/* Smart Match mode */}
          {mode === 'smart' && (
            <>
              <div style={styles.searchCard}>
                <p style={styles.searchTitle}>Describe Your Profile</p>
                <p style={{ margin: '0 0 16px', fontSize: 13, color: '#718096', lineHeight: 1.6 }}>
                  Tell us about yourself in plain English — age, conditions, medications, allergies, and location. Our AI will match you against 985 recruiting clinical trials and explain each result.
                </p>
                <form onSubmit={handleMatch}>
                  <textarea
                    style={styles.textarea}
                    placeholder={SAMPLE_DESCRIPTION}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <div style={{ display: 'flex', gap: 12, marginTop: 14, alignItems: 'center' }}>
                    <button style={styles.button} type="submit">
                      Find Matching Trials
                    </button>
                    <button
                      type="button"
                      style={{ padding: '10px 18px', backgroundColor: '#e2e8f0', color: '#4a5568', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                      onClick={() => setDescription(SAMPLE_DESCRIPTION)}
                    >
                      Use sample
                    </button>
                  </div>
                </form>
              </div>

              {error && (
                <div style={{ color: '#c53030', backgroundColor: '#fff5f5', border: '1px solid #feb2b2', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 14 }}>
                  {error}
                </div>
              )}

              {matching && (
                <div style={styles.loadingWrap}>
                  <div style={styles.spinner} />
                  <p style={{ margin: 0, fontSize: 15 }}>Analyzing your profile against 985 trials...</p>
                </div>
              )}

              {!matching && matchData && (
                <>
                  {renderProfile()}

                  <div style={styles.summaryGrid}>
                    <div style={styles.summaryCard('#38a169')}>
                      <div style={styles.summaryNum}>{summary.qualified ?? 0}</div>
                      <div style={styles.summaryLabel}>Qualified</div>
                    </div>
                    <div style={styles.summaryCard('#d69e2e')}>
                      <div style={styles.summaryNum}>{summary.likely_qualified ?? 0}</div>
                      <div style={styles.summaryLabel}>Likely Qualified</div>
                    </div>
                    <div style={styles.summaryCard('#a0aec0')}>
                      <div style={styles.summaryNum}>{summary.unknown ?? 0}</div>
                      <div style={styles.summaryLabel}>Unknown</div>
                    </div>
                    <div style={styles.summaryCard('#e53e3e')}>
                      <div style={styles.summaryNum}>{summary.excluded ?? 0}</div>
                      <div style={styles.summaryLabel}>Excluded</div>
                    </div>
                  </div>

                  <div style={styles.filterBar}>
                    <button style={styles.filterButton(statusFilter === 'all')} onClick={() => setStatusFilter('all')}>All</button>
                    <button style={styles.filterButton(statusFilter === 'qualifying')} onClick={() => setStatusFilter('qualifying')}>Qualifying</button>
                    <button style={styles.filterButton(statusFilter === 'qualified')} onClick={() => setStatusFilter('qualified')}>Qualified Only</button>
                    <button style={styles.filterButton(statusFilter === 'likely_qualified')} onClick={() => setStatusFilter('likely_qualified')}>Likely Qualified</button>
                    <button style={styles.filterButton(statusFilter === 'unknown')} onClick={() => setStatusFilter('unknown')}>Unknown</button>
                  </div>

                  <div style={styles.resultsHeader}>
                    <p style={styles.resultsCount}>
                      <span style={styles.resultsCountNum}>{filteredResults.length}</span>{' '}
                      {filteredResults.length === 1 ? 'matching trial' : 'matching trials'}
                    </p>
                  </div>

                  {filteredResults.length === 0 ? (
                    <div style={styles.emptyState}>
                      <div style={styles.emptyIcon}>🔍</div>
                      <h3 style={styles.emptyTitle}>No trials in this category</h3>
                      <p style={styles.emptyText}>Try a different filter to see more results.</p>
                    </div>
                  ) : (
                    filteredResults.map((result, i) => (
                      <MatchedTrialCard key={result.trial?.nct_id || i} result={result} />
                    ))
                  )}
                </>
              )}

              {!matching && !matchData && !error && (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>🤖</div>
                  <h3 style={styles.emptyTitle}>AI-powered matching</h3>
                  <p style={styles.emptyText}>Describe your profile above and our AI will analyze your eligibility across hundreds of trials.</p>
                </div>
              )}
            </>
          )}

          {/* Classic Search mode */}
          {mode === 'classic' && (
            <>
              <div style={styles.searchCard}>
                <p style={styles.searchTitle}>Search Trials</p>
                <form style={styles.form} onSubmit={handleSearch}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Condition / Disease</label>
                    <input
                      style={styles.input}
                      type="text"
                      placeholder="e.g. cancer, diabetes"
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                    />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Location</label>
                    <input
                      style={styles.input}
                      type="text"
                      placeholder="e.g. New York, Texas"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                  <div style={{ ...styles.fieldGroup, flex: '0 1 120px' }}>
                    <label style={styles.label}>Age</label>
                    <input
                      style={styles.input}
                      type="number"
                      placeholder="e.g. 45"
                      min="0"
                      max="120"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                    />
                  </div>
                  <button style={styles.button} type="submit">
                    Search Trials
                  </button>
                </form>
              </div>

              {error && (
                <div style={{ color: '#c53030', backgroundColor: '#fff5f5', border: '1px solid #feb2b2', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 14 }}>
                  {error}
                </div>
              )}

              {loading && (
                <div style={styles.loadingWrap}>
                  <div style={styles.spinner} />
                  <p style={{ margin: 0, fontSize: 15 }}>Searching trials...</p>
                </div>
              )}

              {!loading && searched && (
                <>
                  <div style={styles.resultsHeader}>
                    <p style={styles.resultsCount}>
                      <span style={styles.resultsCountNum}>{trials.length}</span>{' '}
                      {trials.length === 1 ? 'trial' : 'trials'} found
                    </p>
                  </div>

                  {trials.length === 0 ? (
                    <div style={styles.emptyState}>
                      <div style={styles.emptyIcon}>🔍</div>
                      <h3 style={styles.emptyTitle}>No trials found</h3>
                      <p style={styles.emptyText}>Try broadening your search criteria.</p>
                    </div>
                  ) : (
                    trials.map((trial) => <TrialCard key={trial.nct_id} trial={trial} />)
                  )}
                </>
              )}

              {!loading && !searched && (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>🩺</div>
                  <h3 style={styles.emptyTitle}>Find your match</h3>
                  <p style={styles.emptyText}>Enter a condition, location, or age above to search recruiting clinical trials.</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}
