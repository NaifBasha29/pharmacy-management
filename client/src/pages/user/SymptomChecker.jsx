import { useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import { aiAPI } from '../../services/api';

const SymptomChecker = () => {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await aiAPI.symptomCheck(symptoms);
      setResult(res.data.data || res.data);
    } catch (err) { setError('Failed to analyze symptoms'); }
    finally { setLoading(false); }
  };

  return (
    <div className="dashboard-layout no-top-nav">
      <Sidebar />
      <main className="dashboard-main" style={{ background: 'var(--bg-primary)', minHeight: '100vh', padding: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>AI <span style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Symptom Checker</span></h1>
          <p style={{ color: 'var(--text-secondary)' }}>Describe symptoms, get suggested conditions and medicine categories</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1rem' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 12 }}>
            <form onSubmit={handleSubmit}>
              <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} placeholder="Enter symptoms (e.g. fever, cough)" className="form-input" style={{ minHeight: 140 }} required />
              <div style={{ marginTop: '0.75rem' }}>
                <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Checking...' : 'Check'}</button>
              </div>
            </form>

            {error && <div className="auth-error" style={{ marginTop: 12 }}>{error}</div>}
            {result && (
              <div style={{ marginTop: 12 }}>
                <h4 style={{ fontWeight: 700 }}>Possible Conditions</h4>
                <ul>
                  {(result.conditions || []).map((c, i) => <li key={i} style={{ color: 'var(--text-secondary)' }}>{c}</li>)}
                </ul>

                <h4 style={{ fontWeight: 700 }}>Suggested Categories</h4>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(result.categories || []).map((cat, i) => (
                    <a key={i} href={`/user/catalog?category=${encodeURIComponent(cat)}`} className="btn" style={{ background: 'var(--bg-tertiary)' }}>{cat}</a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: 12 }}>
            <h4 style={{ fontWeight: 700 }}>Tips</h4>
            <p style={{ color: 'var(--text-secondary)' }}>Provide symptoms separated by commas for better results.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SymptomChecker;
