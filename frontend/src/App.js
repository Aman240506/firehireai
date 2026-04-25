import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UploadPage from './pages/UploadPage';
import ResultsDashboard from './pages/ResultsDashboard';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app-shell">
        <nav className="app-nav">
          <div className="nav-logo">
            <div className="nav-logo-dot" />
            FairHire
            <span style={{ color: 'var(--blue-light)', fontWeight: 300 }}>AI</span>
          </div>
          <span className="nav-badge">Bias Detection</span>
        </nav>
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/results" element={<ResultsDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
