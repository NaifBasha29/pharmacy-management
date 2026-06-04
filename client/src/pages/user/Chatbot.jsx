import { useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import { aiAPI } from '../../services/api';
import ReactMarkdown from 'react-markdown';

const Chatbot = () => {
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    const newHistory = [...history, userMsg];
    setHistory(newHistory);
    setInput('');
    setLoading(true);
    try {
      const res = await aiAPI.chat({ message: input, history: newHistory });
      const assistant = res.data.data?.reply || res.data.data || res.data;
      setHistory(prev => [...prev, { role: 'assistant', content: assistant }]);
    } catch (err) {
      setHistory(prev => [...prev, { role: 'assistant', content: 'Service unavailable' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout no-top-nav">
      <Sidebar />
      <main className="dashboard-main" style={{ background: 'transparent', minHeight: '100vh', padding: '2rem' }}>
        <div style={{ position: 'fixed', right: 24, bottom: 24, width: 360, maxWidth: 'calc(100% - 48px)' }}>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--bg-tertiary)', fontWeight: 700 }}>Rx Assistant</div>
            <div style={{ maxHeight: 360, overflowY: 'auto', padding: '1rem' }}>
              {history.map((m, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{m.role}</div>
                  <div style={{ background: m.role === 'assistant' ? 'var(--bg-tertiary)' : 'linear-gradient(135deg,#f97316,#ea580c)', color: m.role === 'assistant' ? 'var(--text-primary)' : 'white', padding: '0.5rem 0.75rem', borderRadius: 8 }}>
                    {m.role === 'assistant' ? <ReactMarkdown>{String(m.content)}</ReactMarkdown> : <div>{m.content}</div>}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={sendMessage} style={{ padding: '0.75rem', borderTop: '1px solid var(--bg-tertiary)' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={input} onChange={e => setInput(e.target.value)} className="form-input" placeholder="Ask about symptoms, medicines..." />
                <button className="btn btn-primary" disabled={loading} type="submit">{loading ? '...' : 'Send'}</button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chatbot;
