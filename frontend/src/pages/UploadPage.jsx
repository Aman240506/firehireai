import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeCandidate } from '../services/api';

// ── Processing screen steps ──────────────────────────────────────────────────
const STEPS = [
  { id: 0, label: 'Parsing resume structure', icon: '📄' },
  { id: 1, label: 'Evaluating skill alignment', icon: '🧠' },
  { id: 2, label: 'Running bias simulations', icon: '⚖️' },
  { id: 3, label: 'Generating insights', icon: '✨' },
];

const DYNAMIC_TEXT = [
  'Extracting candidate profile…',
  'Matching skills against job description…',
  'Simulating anonymized evaluations…',
  'Building your fairness report…',
];

function ProcessingScreen() {
  const [activeStep, setActiveStep] = useState(0);
  const [dynText, setDynText] = useState(DYNAMIC_TEXT[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => {
        const next = prev < STEPS.length - 1 ? prev + 1 : prev;
        setDynText(DYNAMIC_TEXT[next]);
        return next;
      });
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      className="processing-screen"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="processing-orb">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
        </svg>
      </div>

      <h2 className="processing-title">Analyzing Candidate</h2>
      <AnimatePresence mode="wait">
        <motion.p 
          key={dynText}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="processing-sub"
        >
          {dynText}
        </motion.p>
      </AnimatePresence>

      <div className="steps-list">
        {STEPS.map(step => {
          const isDone = step.id < activeStep;
          const isActive = step.id === activeStep;
          return (
            <motion.div 
              key={step.id} 
              className={`step-item${isActive ? ' active' : ''}${isDone ? ' done' : ''}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: step.id * 0.15 }}
            >
              <div className="step-icon">
                {isDone ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : isActive ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="8" />
                  </svg>
                ) : (
                  <span>{step.icon}</span>
                )}
              </div>
              <span className="step-label">{step.label}</span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ── Upload Page ───────────────────────────────────────────────────────────────
const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) { setFile(e.target.files[0]); setResumeText(''); }
  };
  const handleDragOver = (e) => { e.preventDefault(); e.currentTarget.classList.add('dragover'); };
  const handleDragLeave = (e) => { e.preventDefault(); e.currentTarget.classList.remove('dragover'); };
  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    if (e.dataTransfer.files?.[0]) { setFile(e.dataTransfer.files[0]); setResumeText(''); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!file && !resumeText.trim()) || !jobDescription.trim()) {
      setError('Please provide a resume and a job description.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const result = await analyzeCandidate(file, resumeText, jobDescription);
      if (result.error) { setError(result.error); }
      else { navigate('/results', { state: { result } }); }
    } catch (err) {
      setError('An error occurred while analyzing. Ensure the backend is running and the API key is valid.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <ProcessingScreen />;

  const canSubmit = (file || resumeText.trim()) && jobDescription.trim();

  return (
    <motion.div 
      className="page-content"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Background 3D Elements (Subtle) */}
      <div style={{ position: 'absolute', top: -100, left: -100, width: '150%', height: '150%', pointerEvents: 'none', zIndex: -1, overflow: 'hidden' }}>
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: 'absolute', top: '10%', right: '15%', width: 200, height: 280, border: '1px solid rgba(99,102,241,0.1)', borderRadius: 16, background: 'linear-gradient(135deg, rgba(255,255,255,0.03), transparent)', backdropFilter: 'blur(4px)', transform: 'perspective(1000px) rotateY(-20deg) rotateX(10deg)' }}
        />
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          style={{ position: 'absolute', bottom: '20%', left: '5%', width: 150, height: 200, border: '1px solid rgba(168,85,247,0.1)', borderRadius: 16, background: 'linear-gradient(135deg, rgba(255,255,255,0.02), transparent)', backdropFilter: 'blur(4px)', transform: 'perspective(1000px) rotateY(20deg) rotateX(-10deg)' }}
        />
      </div>

      {/* Hero */}
      <div className="upload-hero">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          Detect bias.<br />Make fair decisions.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Upload a resume and job description. Our AI runs blind simulations to surface hidden bias in your hiring pipeline.
        </motion.p>
      </div>

      {/* Card */}
      <motion.div 
        className="upload-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <AnimatePresence>
          {error && (
            <motion.div 
              className="error-box"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: '1.5rem' }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit}>
          {/* Resume Section */}
          <div className="form-section">
            <label className="form-label">Resume</label>
            <motion.div
              className="drop-zone"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('fileInput').click()}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <input id="fileInput" type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleFileChange} />
              {file ? (
                <div className="drop-zone-selected">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  </svg>
                  {file.name}
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); setFile(null); }}
                    style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', opacity: 0.6, fontSize: '1.25rem', lineHeight: 1 }}
                  >×</button>
                </div>
              ) : (
                <>
                  <div className="drop-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
                      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                    </svg>
                  </div>
                  <div className="drop-zone-title">Drop PDF resume here</div>
                  <div className="drop-zone-sub">or click to browse</div>
                </>
              )}
            </motion.div>

            <div className="divider">or paste text</div>

            <textarea
              className="textarea-dark"
              placeholder="Paste resume content here…"
              value={resumeText}
              onChange={e => { setResumeText(e.target.value); if (e.target.value) setFile(null); }}
            />
          </div>

          {/* Job Description */}
          <div className="form-section">
            <label className="form-label">Job Description</label>
            <textarea
              className="textarea-dark"
              placeholder="Paste the job description here…"
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
            />
          </div>

          <motion.button 
            type="submit" 
            className="cta-btn" 
            disabled={!canSubmit}
            whileHover={canSubmit ? { scale: 1.02, boxShadow: "0 8px 24px rgba(99,102,241,0.4)" } : {}}
            whileTap={canSubmit ? { scale: 0.98 } : {}}
          >
            Analyze Fairness →
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default UploadPage;
