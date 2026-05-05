import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';

const SAMPLE_DESCRIPTION = "I am a 42-year-old woman, diagnosed with stage 2 breast cancer six months ago. I'm currently taking tamoxifen and am allergic to sulfa drugs. I live in Phoenix, Arizona.";

// Warm, consumer-friendly palette
const C = {
  bg: '#f6f1ea',           // warm cream
  bgAlt: '#fbf7f1',
  surface: '#ffffff',
  ink: '#2f3a36',          // soft charcoal
  inkSoft: '#6b7a72',
  inkMuted: '#94a399',
  teal: '#2f8c8a',         // soft teal
  tealDeep: '#1f6b6a',
  tealSoft: '#dff0ee',
  sage: '#9bb8a3',
  sageSoft: '#e6efe6',
  cream: '#f3ebdc',
  sun: '#e7b85a',
  sunSoft: '#fbecc7',
  rose: '#c98a8a',
  roseSoft: '#f5dede',
  border: '#ece4d7',
};

const STATUS_META = {
  qualified: {
    label: 'Strong Match',
    icon: '✓',
    color: C.teal,
    bg: C.tealSoft,
    text: C.tealDeep,
  },
  likely_qualified: {
    label: 'Possible Match',
    icon: '~',
    color: C.sun,
    bg: C.sunSoft,
    text: '#7a5a14',
  },
  unknown: {
    label: 'Needs Review',
    icon: '?',
    color: C.inkMuted,
    bg: '#eee9df',
    text: '#5a6660',
  },
  excluded: {
    label: 'Not a Fit',
    icon: '✗',
    color: C.rose,
    bg: C.roseSoft,
    text: '#8a4a4a',
  },
};

const styles = {
  root: {
    minHeight: '100vh',
    backgroundColor: C.bg,
    fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
    color: C.ink,
    fontSize: 16,
    lineHeight: 1.55,
  },
  header: {
    background: `linear-gradient(135deg, ${C.tealSoft} 0%, ${C.sageSoft} 60%, ${C.cream} 100%)`,
    padding: '40px 32px 56px',
    borderBottom: `1px solid ${C.border}`,
  },
  headerInner: {
    maxWidth: 1100,
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  headerIcon: {
    fontSize: 40,
    background: '#fff',
    width: 64, height: 64,
    borderRadius: 20,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 6px 20px rgba(47,140,138,0.15)',
  },
  headerTitle: {
    margin: 0,
    fontSize: 28,
    fontWeight: 700,
    color: C.tealDeep,
    letterSpacing: '-0.5px',
  },
  headerSub: {
    margin: '4px 0 0',
    fontSize: 15,
    color: C.inkSoft,
  },
  main: {
    maxWidth: 1100,
    margin: '-32px auto 0',
    padding: '0 16px 64px',
    position: 'relative',
  },
  searchCard: {
    backgroundColor: C.surface,
    borderRadius: 24,
    padding: '32px 36px',
    boxShadow: '0 8px 30px rgba(47,58,54,0.06)',
    marginBottom: 28,
    border: `1px solid ${C.border}`,
  },
  searchTitle: {
    margin: '0 0 6px',
    fontSize: 20,
    fontWeight: 700,
    color: C.ink,
  },
  searchHint: {
    margin: '0 0 18px',
    fontSize: 15,
    color: C.inkSoft,
    lineHeight: 1.6,
  },
  form: {
    display: 'flex',
    gap: 14,
    flexWrap: 'wrap',
    alignItems: 'flex-end',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    flex: '1 1 180px',
  },
  label: {
    fontSize: 14,
    fontWeight: 600,
    color: C.ink,
  },
  input: {
    padding: '14px 16px',
    border: `1.5px solid ${C.border}`,
    borderRadius: 14,
    fontSize: 15,
    outline: 'none',
    transition: 'all 0.2s',
    backgroundColor: C.bgAlt,
    color: C.ink,
    fontFamily: 'inherit',
  },
  textarea: {
    padding: '16px 18px',
    border: `1.5px solid ${C.border}`,
    borderRadius: 16,
    fontSize: 16,
    outline: 'none',
    backgroundColor: C.bgAlt,
    minHeight: 130,
    fontFamily: 'inherit',
    resize: 'vertical',
    width: '100%',
    boxSizing: 'border-box',
    lineHeight: 1.6,
    color: C.ink,
  },
  button: {
    padding: '14px 28px',
    background: `linear-gradient(135deg, ${C.teal} 0%, ${C.tealDeep} 100%)`,
    color: '#fff',
    border: 'none',
    borderRadius: 14,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(47,140,138,0.28)',
    transition: 'transform 0.15s, box-shadow 0.2s',
    whiteSpace: 'nowrap',
  },
  buttonGhost: {
    padding: '14px 22px',
    backgroundColor: 'transparent',
    color: C.tealDeep,
    border: `1.5px solid ${C.tealSoft}`,
    borderRadius: 14,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  resultsHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    padding: '0 4px',
  },
  resultsCount: {
    fontSize: 15,
    color: C.inkSoft,
    margin: 0,
  },
  resultsCountNum: {
    fontWeight: 700,
    color: C.tealDeep,
  },
  card: {
    backgroundColor: C.surface,
    borderRadius: 22,
    padding: '26px 28px',
    boxShadow: '0 4px 18px rgba(47,58,54,0.05)',
    marginBottom: 18,
    border: `1px solid ${C.border}`,
    transition: 'transform 0.15s, box-shadow 0.2s',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 14,
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  cardTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    color: C.ink,
    lineHeight: 1.4,
    flex: 1,
  },
  badge: {
    display: 'inline-block',
    padding: '6px 14px',
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 600,
    backgroundColor: C.sageSoft,
    color: '#3a6b48',
    whiteSpace: 'nowrap',
  },
  cardMeta: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: 16,
    marginBottom: 16,
    padding: '14px 16px',
    backgroundColor: C.bgAlt,
    borderRadius: 14,
  },
  metaItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: C.inkMuted,
  },
  metaValue: {
    fontSize: 14,
    color: C.ink,
    fontWeight: 500,
  },
  scoreBar: {
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 13,
    color: C.inkSoft,
    marginBottom: 6,
    display: 'flex',
    justifyContent: 'space-between',
    fontWeight: 500,
  },
  scoreTrack: {
    height: 8,
    backgroundColor: C.bgAlt,
    borderRadius: 999,
    overflow: 'hidden',
  },
  scoreFill: (pct, color) => ({
    height: '100%',
    width: `${pct}%`,
    background: `linear-gradient(90deg, ${color} 0%, ${color} 100%)`,
    borderRadius: 999,
    transition: 'width 0.5s ease',
  }),
  detailsButton: {
    padding: '10px 20px',
    backgroundColor: C.bgAlt,
    color: C.tealDeep,
    border: 'none',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  detailsBox: {
    marginTop: 18,
    paddingTop: 18,
    borderTop: `1px dashed ${C.border}`,
  },
  detailsSection: {
    marginBottom: 16,
  },
  detailsSectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: C.tealDeep,
    marginBottom: 6,
  },
  detailsText: {
    fontSize: 14,
    color: C.ink,
    lineHeight: 1.7,
    whiteSpace: 'pre-wrap',
  },
  emptyState: {
    textAlign: 'center',
    padding: '70px 20px',
    color: C.inkSoft,
    backgroundColor: C.surface,
    borderRadius: 24,
    border: `1px dashed ${C.border}`,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: C.ink,
    margin: '0 0 8px',
  },
  emptyText: {
    fontSize: 15,
    margin: 0,
    color: C.inkSoft,
  },
  loadingWrap: {
    textAlign: 'center',
    padding: '70px 20px',
    color: C.inkSoft,
    backgroundColor: C.surface,
    borderRadius: 24,
    border: `1px solid ${C.border}`,
  },
  pulse: {
    display: 'inline-flex',
    gap: 8,
    marginBottom: 18,
  },
  pulseDot: (delay) => ({
    width: 14, height: 14,
    borderRadius: '50%',
    backgroundColor: C.teal,
    animation: `gentlePulse 1.4s ease-in-out ${delay}s infinite`,
  }),
  tabBar: {
    display: 'inline-flex',
    gap: 4,
    marginBottom: 24,
    padding: 6,
    backgroundColor: C.surface,
    borderRadius: 16,
    border: `1px solid ${C.border}`,
    boxShadow: '0 2px 8px rgba(47,58,54,0.04)',
  },
  tab: (active) => ({
    padding: '10px 22px',
    backgroundColor: active ? C.tealDeep : 'transparent',
    border: 'none',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 600,
    color: active ? '#fff' : C.inkSoft,
    cursor: 'pointer',
    transition: 'all 0.2s',
  }),
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: 14,
    marginBottom: 28,
  },
  summaryCard: (bg, accent) => ({
    backgroundColor: bg,
    borderRadius: 20,
    padding: '20px 22px',
    border: `1px solid ${C.border}`,
    position: 'relative',
    overflow: 'hidden',
  }),
  summaryNum: {
    fontSize: 34,
    fontWeight: 700,
    color: C.ink,
    lineHeight: 1.1,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: C.inkSoft,
  },
  filterBar: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  filterButton: (active) => ({
    padding: '9px 18px',
    borderRadius: 999,
    border: `1.5px solid ${active ? C.tealDeep : C.border}`,
    backgroundColor: active ? C.tealDeep : C.surface,
    color: active ? '#fff' : C.inkSoft,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
  }),
  statusPill: (status) => {
    const m = STATUS_META[status] || STATUS_META.unknown;
    return {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 14px',
      borderRadius: 999,
      fontSize: 13,
      fontWeight: 600,
      backgroundColor: m.bg,
      color: m.text,
      whiteSpace: 'nowrap',
    };
  },
  statusIcon: (status) => {
    const m = STATUS_META[status] || STATUS_META.unknown;
    return {
      display: 'inline-flex',
      alignItems: 'center', justifyContent: 'center',
      width: 20, height: 20,
      borderRadius: '50%',
      backgroundColor: m.color,
      color: '#fff',
      fontSize: 12,
      fontWeight: 700,
    };
  },
  reasonsBox: {
    backgroundColor: C.bgAlt,
    borderRadius: 14,
    padding: '14px 18px',
    marginBottom: 16,
  },
  reasonsTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: C.tealDeep,
    marginBottom: 8,
  },
  reasonItem: {
    fontSize: 14,
    color: C.ink,
    lineHeight: 1.6,
    paddingLeft: 18,
    position: 'relative',
    marginBottom: 6,
  },
  matchedChip: {
    display: 'inline-block',
    padding: '5px 12px',
    backgroundColor: C.sageSoft,
    color: '#3a6b48',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    marginRight: 6,
    marginBottom: 6,
  },
  matchedRow: {
    marginBottom: 14,
  },
  matchedLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: C.inkMuted,
    marginBottom: 6,
  },
  profileCard: {
    background: `linear-gradient(135deg, ${C.cream} 0%, ${C.sageSoft} 100%)`,
    borderRadius: 20,
    padding: '20px 24px',
    marginBottom: 24,
    border: `1px solid ${C.border}`,
  },
  profileHeading: {
    fontSize: 14,
    fontWeight: 700,
    color: C.tealDeep,
    margin: '0 0 6px',
  },
  profileText: {
    fontSize: 15,
    color: C.ink,
    margin: 0,
    lineHeight: 1.6,
  },
  errorBox: {
    color: '#8a4a4a',
    backgroundColor: C.roseSoft,
    border: `1px solid ${C.rose}`,
    borderRadius: 14,
    padding: '14px 18px',
    marginBottom: 20,
    fontSize: 14,
  },
};

function TrialCard({ trial }) {
  const [expanded, setExpanded] = useState(false);
  const location = [trial.location_city, trial.location_state, trial.location_country]
    .filter(Boolean).join(', ') || 'Not specified';
  const score = trial.relevance_score ?? 0;
  const scorePct = Math.min(Math.round((score / 100) * 100), 100);
  const scoreColor = scorePct >= 70 ? C.teal : scorePct >= 40 ? C.sun : C.rose;

  return (
    <div style={styles.card}>
      <div style={styles.cardTop}>
        <h3 style={styles.cardTitle}>{trial.title || 'Untitled Trial'}</h3>
        <span style={styles.badge}>{trial.status || 'RECRUITING'}</span>
      </div>

      <div style={styles.cardMeta}>
        <div style={styles.metaItem}><span style={styles.metaLabel}>Condition</span><span style={styles.metaValue}>{trial.condition || '—'}</span></div>
        <div style={styles.metaItem}><span style={styles.metaLabel}>Phase</span><span style={styles.metaValue}>{trial.phase || '—'}</span></div>
        <div style={styles.metaItem}><span style={styles.metaLabel}>Location</span><span style={styles.metaValue}>{location}</span></div>
        <div style={styles.metaItem}><span style={styles.metaLabel}>Sponsor</span><span style={styles.metaValue}>{trial.sponsor || '—'}</span></div>
        <div style={styles.metaItem}><span style={styles.metaLabel}>Age Range</span><span style={styles.metaValue}>{[trial.min_age, trial.max_age].filter(Boolean).join(' – ') || '—'}</span></div>
        <div style={styles.metaItem}><span style={styles.metaLabel}>NCT ID</span><span style={styles.metaValue}>{trial.nct_id}</span></div>
      </div>

      <div style={styles.scoreBar}>
        <div style={styles.scoreLabel}>
          <span>Relevance</span><span>{scorePct}%</span>
        </div>
        <div style={styles.scoreTrack}>
          <div style={styles.scoreFill(scorePct, scoreColor)} />
        </div>
      </div>

      <button style={styles.detailsButton} onClick={() => setExpanded(!expanded)}>
        {expanded ? 'Hide details' : 'View details'}
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
              <p style={styles.detailsText}>{trial.last_updated}</p>
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
  const meta = STATUS_META[status] || STATUS_META.unknown;
  const location = [trial.location_city, trial.location_state, trial.location_country]
    .filter(Boolean).join(', ') || 'Not specified';

  return (
    <div style={styles.card}>
      <div style={styles.cardTop}>
        <h3 style={styles.cardTitle}>{trial.title || 'Untitled Trial'}</h3>
        <span style={styles.statusPill(status)}>
          <span style={styles.statusIcon(status)}>{meta.icon}</span>
          {meta.label}
        </span>
      </div>

      <div style={styles.scoreBar}>
        <div style={styles.scoreLabel}>
          <span>Match strength</span><span>{scorePct}/100</span>
        </div>
        <div style={styles.scoreTrack}>
          <div style={styles.scoreFill(scorePct, meta.color)} />
        </div>
      </div>

      {result.matched_conditions && result.matched_conditions.length > 0 && (
        <div style={styles.matchedRow}>
          <div style={styles.matchedLabel}>Matched on</div>
          {result.matched_conditions.map((c, i) => (
            <span key={i} style={styles.matchedChip}>{c}</span>
          ))}
        </div>
      )}

      {result.reasons && result.reasons.length > 0 && (
        <div style={styles.reasonsBox}>
          <div style={styles.reasonsTitle}>Why we picked this</div>
          {result.reasons.map((r, i) => (
            <div key={i} style={styles.reasonItem}>
              <span style={{ position: 'absolute', left: 0, color: meta.color, fontWeight: 700 }}>•</span>
              {r}
            </div>
          ))}
        </div>
      )}

      <div style={styles.cardMeta}>
        <div style={styles.metaItem}><span style={styles.metaLabel}>NCT ID</span><span style={styles.metaValue}>{trial.nct_id || '—'}</span></div>
        <div style={styles.metaItem}><span style={styles.metaLabel}>Condition</span><span style={styles.metaValue}>{trial.condition || '—'}</span></div>
        <div style={styles.metaItem}><span style={styles.metaLabel}>Phase</span><span style={styles.metaValue}>{trial.phase || '—'}</span></div>
        <div style={styles.metaItem}><span style={styles.metaLabel}>Sponsor</span><span style={styles.metaValue}>{trial.sponsor || '—'}</span></div>
        <div style={styles.metaItem}><span style={styles.metaLabel}>Location</span><span style={styles.metaValue}>{location}</span></div>
      </div>

      <button style={styles.detailsButton} onClick={() => setExpanded(!expanded)}>
        {expanded ? 'Hide trial details' : 'View trial details'}
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
      setError('We couldn\'t reach the trial database right now. Please try again in a moment.');
      setTrials([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMatch = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please tell us a little about yourself first.');
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
      setError('We couldn\'t analyze your profile right now. Please try again in a moment.');
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
        <p style={styles.profileHeading}>Here's what we found about you</p>
        <p style={styles.profileText}>
          {parts.length > 0 ? parts.join(' · ') : 'We couldn\'t pick out specific details — try adding a bit more context above.'}
        </p>
      </div>
    );
  };

  const summary = matchData && matchData.summary ? matchData.summary : {};

  return (
    <div style={styles.root}>
      <style>{`
        @keyframes gentlePulse {
          0%, 100% { transform: scale(0.7); opacity: 0.5; }
          50% { transform: scale(1); opacity: 1; }
        }
        input:focus, textarea:focus {
          border-color: ${C.teal} !important;
          background: #fff !important;
          box-shadow: 0 0 0 4px ${C.tealSoft} !important;
        }
        button:hover { transform: translateY(-1px); }
        button:active { transform: translateY(0); }
      `}</style>

      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.headerIcon}>🌿</div>
          <div>
            <h1 style={styles.headerTitle}>Trial Companion</h1>
            <p style={styles.headerSub}>Finding clinical trials that fit you — gently, clearly, in plain English.</p>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.tabBar}>
          <button style={styles.tab(mode === 'smart')} onClick={() => setMode('smart')}>✨ Smart Match (AI)</button>
          <button style={styles.tab(mode === 'classic')} onClick={() => setMode('classic')}>🔎 Classic Search</button>
        </div>

        {mode === 'smart' && (
          <>
            <div style={styles.searchCard}>
              <p style={styles.searchTitle}>Tell us about yourself</p>
              <p style={styles.searchHint}>
                Share a few sentences in your own words — your age, conditions, medications, allergies, and where you live. We'll thoughtfully look through 985 recruiting trials and explain each suggestion.
              </p>
              <form onSubmit={handleMatch}>
                <textarea
                  style={styles.textarea}
                  placeholder="e.g. I'm a 42-year-old woman with stage 2 breast cancer, taking tamoxifen, allergic to sulfa drugs, living in Phoenix, Arizona…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <div style={{ display: 'flex', gap: 12, marginTop: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                  <button style={styles.button} type="submit">Find my trials</button>
                  <button type="button" style={styles.buttonGhost} onClick={() => setDescription(SAMPLE_DESCRIPTION)}>
                    Try a sample
                  </button>
                </div>
              </form>
            </div>

            {error && <div style={styles.errorBox}>{error}</div>}

            {matching && (
              <div style={styles.loadingWrap}>
                <div style={styles.pulse}>
                  <span style={styles.pulseDot(0)} />
                  <span style={styles.pulseDot(0.2)} />
                  <span style={styles.pulseDot(0.4)} />
                </div>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>Analyzing your profile…</p>
                <p style={{ margin: '6px 0 0', fontSize: 14, color: C.inkMuted }}>Reading through 985 trials with care.</p>
              </div>
            )}

            {!matching && matchData && (
              <>
                {renderProfile()}

                <div style={styles.summaryGrid}>
                  <div style={styles.summaryCard(C.tealSoft)}>
                    <div style={styles.summaryNum}>{summary.qualified ?? 0}</div>
                    <div style={styles.summaryLabel}>Strong matches</div>
                  </div>
                  <div style={styles.summaryCard(C.sunSoft)}>
                    <div style={styles.summaryNum}>{summary.likely_qualified ?? 0}</div>
                    <div style={styles.summaryLabel}>Possible matches</div>
                  </div>
                  <div style={styles.summaryCard('#eee9df')}>
                    <div style={styles.summaryNum}>{summary.unknown ?? 0}</div>
                    <div style={styles.summaryLabel}>Need a closer look</div>
                  </div>
                  <div style={styles.summaryCard(C.roseSoft)}>
                    <div style={styles.summaryNum}>{summary.excluded ?? 0}</div>
                    <div style={styles.summaryLabel}>Not a fit</div>
                  </div>
                </div>

                <div style={styles.filterBar}>
                  <button style={styles.filterButton(statusFilter === 'all')} onClick={() => setStatusFilter('all')}>Show all</button>
                  <button style={styles.filterButton(statusFilter === 'qualifying')} onClick={() => setStatusFilter('qualifying')}>Worth exploring</button>
                  <button style={styles.filterButton(statusFilter === 'qualified')} onClick={() => setStatusFilter('qualified')}>✓ Strong matches</button>
                  <button style={styles.filterButton(statusFilter === 'likely_qualified')} onClick={() => setStatusFilter('likely_qualified')}>~ Possible matches</button>
                  <button style={styles.filterButton(statusFilter === 'unknown')} onClick={() => setStatusFilter('unknown')}>? Needs review</button>
                </div>

                <div style={styles.resultsHeader}>
                  <p style={styles.resultsCount}>
                    Showing <span style={styles.resultsCountNum}>{filteredResults.length}</span>{' '}
                    {filteredResults.length === 1 ? 'trial' : 'trials'}
                  </p>
                </div>

                {filteredResults.length === 0 ? (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>🌱</div>
                    <h3 style={styles.emptyTitle}>Nothing in this view yet</h3>
                    <p style={styles.emptyText}>Try a different filter above — there may be matches waiting in another category.</p>
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
                <div style={styles.emptyIcon}>💬</div>
                <h3 style={styles.emptyTitle}>Ready when you are</h3>
                <p style={styles.emptyText}>Share a little about yourself above and we'll find trials that might be a good fit.</p>
              </div>
            )}
          </>
        )}

        {mode === 'classic' && (
          <>
            <div style={styles.searchCard}>
              <p style={styles.searchTitle}>Search by the basics</p>
              <p style={styles.searchHint}>Prefer to keep things simple? Just enter what you know.</p>
              <form style={styles.form} onSubmit={handleSearch}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>What condition?</label>
                  <input style={styles.input} type="text" placeholder="e.g. breast cancer, diabetes" value={condition} onChange={(e) => setCondition(e.target.value)} />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Where do you live?</label>
                  <input style={styles.input} type="text" placeholder="e.g. Phoenix, Texas" value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
                <div style={{ ...styles.fieldGroup, flex: '0 1 130px' }}>
                  <label style={styles.label}>Your age</label>
                  <input style={styles.input} type="number" placeholder="e.g. 45" min="0" max="120" value={age} onChange={(e) => setAge(e.target.value)} />
                </div>
                <button style={styles.button} type="submit">Search trials</button>
              </form>
            </div>

            {error && <div style={styles.errorBox}>{error}</div>}

            {loading && (
              <div style={styles.loadingWrap}>
                <div style={styles.pulse}>
                  <span style={styles.pulseDot(0)} />
                  <span style={styles.pulseDot(0.2)} />
                  <span style={styles.pulseDot(0.4)} />
                </div>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>Looking through trials for you…</p>
              </div>
            )}

            {!loading && searched && (
              <>
                <div style={styles.resultsHeader}>
                  <p style={styles.resultsCount}>
                    Found <span style={styles.resultsCountNum}>{trials.length}</span>{' '}
                    {trials.length === 1 ? 'trial' : 'trials'}
                  </p>
                </div>
                {trials.length === 0 ? (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>🌿</div>
                    <h3 style={styles.emptyTitle}>Nothing matched — yet</h3>
                    <p style={styles.emptyText}>Try a broader condition or remove a filter. Sometimes simpler is better.</p>
                  </div>
                ) : (
                  trials.map((trial) => <TrialCard key={trial.nct_id} trial={trial} />)
                )}
              </>
            )}

            {!loading && !searched && (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>🍃</div>
                <h3 style={styles.emptyTitle}>Let's find your match</h3>
                <p style={styles.emptyText}>Add a condition, your city, or your age above to begin.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
