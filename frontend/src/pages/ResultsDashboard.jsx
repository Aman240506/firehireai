import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

// ── 3D Tilt Card ──────────────────────────────────────────────────────────────
const TiltCard = ({ children, className, delay = 0 }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-6, 6]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className={className}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      <div style={{ transform: "translateZ(20px)" }}>
        {children}
      </div>
    </motion.div>
  );
};

// ── Animated score counter ────────────────────────────────────────────────────
function useCountUp(target, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return val;
}

// ── SVG Ring ──────────────────────────────────────────────────────────────────
function ScoreRing({ score, color }) {
  const R = 38;
  const C = 2 * Math.PI * R;
  const offset = C - (score / 100) * C;
  return (
    <div className="score-ring-wrap">
      <svg width="100" height="100" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <circle
          cx="45" cy="45" r={R}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={C}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div className="score-ring-center">
        <div className="score-ring-number" style={{ color }}>{score}</div>
        <div className="score-ring-label">/ 100</div>
      </div>
    </div>
  );
}

// ── Bias card icon map ────────────────────────────────────────────────────────
function biasIcon(type) {
  if (type?.toLowerCase().includes('name') || type?.toLowerCase().includes('gender'))
    return { emoji: '👤', bg: 'rgba(168,85,247,0.15)', color: '#c084fc' };
  if (type?.toLowerCase().includes('college') || type?.toLowerCase().includes('education'))
    return { emoji: '🎓', bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' };
  if (type?.toLowerCase().includes('gap') || type?.toLowerCase().includes('experience'))
    return { emoji: '📅', bg: 'rgba(99,102,241,0.15)', color: 'var(--blue-light)' };
  return { emoji: '⚠️', bg: 'rgba(239,68,68,0.15)', color: '#f87171' };
}

// ── Main component ─────────────────────────────────────────────────────────────
const ResultsDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { result } = location.state || {};
  const animScore = useCountUp(result?.matchScore ?? 0);

  useEffect(() => {
    if (!result) navigate('/');
  }, [result, navigate]);

  if (!result) return null;

  const { matchScore, matchingSkills = [], missingSkills = [], biasScore, biasFactors = [], recommendation } = result;

  // Score colour
  const scoreColor = matchScore >= 80 ? 'var(--green)' : matchScore >= 60 ? 'var(--amber)' : 'var(--red)';

  // Bias-free score = highest bias-adjusted score
  const biasFreeScore = biasFactors.length > 0
    ? Math.min(100, matchScore + Math.max(...biasFactors.map(f => parseInt(f.impact) || 0)))
    : matchScore;

  // Verdict text
  const verdictMap = {
    Low: 'No significant bias detected in simulations.',
    Medium: 'Moderate bias detected — review non-skill factors.',
    High: 'Significant bias detected. Re-evaluate fairly.',
  };

  return (
    <motion.div 
      className="page-content-wide"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* ── Summary Bar ── */}
      <TiltCard className="summary-bar" delay={0.1}>
        <ScoreRing score={animScore} color={scoreColor} />

        <div className="summary-verdict">
          <h2>
            {matchScore >= 80 ? 'Strong Match' : matchScore >= 60 ? 'Moderate Match' : 'Weak Match'}
          </h2>
          <p>{verdictMap[biasScore] ?? 'Evaluation complete.'}</p>
        </div>

        <div className="summary-right">
          <span className={`bias-badge bias-${biasScore}`}>
            <span className="bias-badge-dot" />
            {biasScore} Risk
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>
            {biasFactors.length} bias factor{biasFactors.length !== 1 ? 's' : ''} detected
          </span>
        </div>
      </TiltCard>

      {/* ── Main Grid ── */}
      <div className="results-grid">

        {/* LEFT: Skill Match */}
        <TiltCard className="panel" delay={0.2}>
          <div className="panel-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Skill Match Analysis
          </div>
          <div className="skill-score-row">
            <div className="skill-score-num" style={{ color: scoreColor }}>{animScore}<span style={{ fontSize: '1.25rem', fontWeight: 400, color: 'var(--text-3)', textShadow: 'none' }}>%</span></div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>{matchingSkills.length} of {matchingSkills.length + missingSkills.length} core skills</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${matchScore}%` }} />
          </div>
          <div className="skills-cols">
            <div className="skills-col-match">
              <div className="skills-col-title">Matching ({matchingSkills.length})</div>
              <div className="tag-list">
                {matchingSkills.length > 0
                  ? matchingSkills.map((s, i) => <span key={i} className="skill-tag skill-tag-match">{s}</span>)
                  : <span style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>None found</span>}
              </div>
            </div>
            <div className="skills-col-missing">
              <div className="skills-col-title">Missing ({missingSkills.length})</div>
              <div className="tag-list">
                {missingSkills.length > 0
                  ? missingSkills.map((s, i) => <span key={i} className="skill-tag skill-tag-missing">{s}</span>)
                  : <span style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>None</span>}
              </div>
            </div>
          </div>
        </TiltCard>

        {/* LEFT: Bias Impact Visualization */}
        <TiltCard className="panel" delay={0.3}>
          <div className="panel-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
            Simulated Bias Impact
          </div>
          <div className="bias-compare">
            <div className="bias-compare-row bias-original">
              <span className="bias-compare-label">Baseline</span>
              <div className="bias-compare-bar-wrap">
                <div className="bias-compare-track">
                  <div className="bias-compare-fill bias-original" style={{ width: `${matchScore}%` }} />
                </div>
              </div>
              <span className="bias-compare-val" style={{ color: 'var(--amber)' }}>{matchScore}%</span>
            </div>
            <div className="bias-compare-row bias-free">
              <span className="bias-compare-label">Bias-Free</span>
              <div className="bias-compare-bar-wrap">
                <div className="bias-compare-track">
                  <div className="bias-compare-fill bias-free" style={{ width: `${biasFreeScore}%` }} />
                </div>
              </div>
              <span className="bias-compare-val" style={{ color: 'var(--cyan)' }}>{biasFreeScore}%</span>
            </div>
          </div>

          {biasFreeScore !== matchScore ? (
            <motion.div 
              className={`bias-delta ${biasFreeScore > matchScore ? 'bias-delta-pos' : 'bias-delta-neg'}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {biasFreeScore > matchScore ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
              </svg>
              {Math.abs(biasFreeScore - matchScore)}% score variance detected when demographic data is removed.
            </motion.div>
          ) : (
            <motion.div 
              className="bias-delta bias-delta-pos"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Stable score. Blind simulations did not alter the evaluation.
            </motion.div>
          )}
        </TiltCard>

        {/* RIGHT: Bias Breakdown */}
        <TiltCard className="panel" delay={0.4}>
          <div className="panel-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Factors Analyzed
          </div>
          {biasFactors.length > 0 ? biasFactors.map((f, i) => {
            const { emoji, bg } = biasIcon(f.type);
            const isPos = f.impact.startsWith('+');
            return (
              <motion.div 
                key={i} 
                className="bias-card"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                whileHover={{ scale: 1.02, rotateY: 2, rotateX: 2 }}
              >
                <div className="bias-card-header">
                  <div className="bias-card-title">
                    <div className="bias-card-icon" style={{ background: bg }}>
                      <span>{emoji}</span>
                    </div>
                    <span>{f.type}</span>
                  </div>
                  <span className={`bias-card-impact ${isPos ? 'impact-pos' : 'impact-neg'}`}>{f.impact}</span>
                </div>
                <p className="bias-card-reason">{f.reason}</p>
              </motion.div>
            );
          }) : (
            <motion.div 
              className="no-bias-state"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="no-bias-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <strong style={{ color: 'var(--green)', fontSize: '0.95rem', letterSpacing: '0.02em' }}>No Bias Discovered</strong>
              <p>Anonymized simulations confirmed the match score is strictly based on technical merit.</p>
            </motion.div>
          )}
        </TiltCard>

        {/* RIGHT: Recommendation Panel */}
        <motion.div 
          className="rec-panel"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
          whileHover={{ scale: 1.01, boxShadow: "0 0 50px rgba(99,102,241,0.25), inset 0 0 30px rgba(168,85,247,0.15)" }}
        >
          <div className="rec-content">
            <div className="rec-label">AI Fairness Recommendation</div>
            <div className="rec-text">{recommendation}</div>
          </div>
          <motion.button 
            className="rec-btn" 
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ← Analyze Another
          </motion.button>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default ResultsDashboard;
