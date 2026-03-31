import { useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import { FiMessageCircle, FiPhone, FiMail, FiHelpCircle, FiChevronDown, FiChevronUp, FiSend, FiClock, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { supportAPI } from '../../services/api';

const Support = () => {
    const [activeSection, setActiveSection] = useState('faq');
    const [expandedFaq, setExpandedFaq] = useState(null);
    const [ticketForm, setTicketForm] = useState({ subject: '', category: '', message: '' });
    const [submitting, setSubmitting] = useState(false);

    const faqs = [
        { q: 'How do I track my order?', a: 'Go to My Orders page, click on any order to expand details and see the current status. Once dispatched, you can track the shipment in real-time.' },
        { q: 'How long does delivery take?', a: 'Standard delivery takes 2-5 business days. Express delivery (available in select cities) delivers within 24 hours.' },
        { q: 'Can I cancel my order?', a: 'You can cancel orders that are still in "Pending" status. Go to My Orders, find the order, and click Cancel. Refunds are processed within 5-7 business days.' },
        { q: 'What payment methods are accepted?', a: 'We accept Credit/Debit Cards, UPI, Net Banking, and Cash on Delivery (COD) for orders under ₹5000.' },
        { q: 'How do I upload a prescription?', a: 'Go to the Prescriptions page, click Upload, select your prescription image or PDF, and submit. Our pharmacists will verify it within 2 hours.' },
        { q: 'Is my health information secure?', a: 'Yes, all your health data is encrypted and stored securely. We follow strict HIPAA compliance guidelines and never share your information with third parties.' }
    ];

    const handleTicketSubmit = async (e) => {
        e.preventDefault();
        if (!ticketForm.subject || !ticketForm.category || !ticketForm.message) {
            toast.error('Please fill all fields');
            return;
        }
        setSubmitting(true);
        try {
            await supportAPI.create(ticketForm);
            toast.success('Support ticket created! We\'ll respond within 24 hours.');
            setTicketForm({ subject: '', category: '', message: '' });
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to create ticket';
            toast.error(message);
        } finally {
            setSubmitting(false);
        }
    };

    const page = { background: 'var(--bg-primary)', minHeight: '100vh', padding: '2rem' };
    const card = { background: 'var(--bg-secondary)', borderRadius: '1rem', boxShadow: '0 2px 8px var(--border-light)', overflow: 'hidden' };
    const input = { width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--border-light)', borderRadius: '0.75rem', background: 'var(--bg-tertiary)', outline: 'none', fontSize: '0.9375rem' };
    const label = { display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' };
    const btn = { padding: '0.875rem 1.5rem', fontWeight: 600, color: 'white', background: 'linear-gradient(135deg, #f97316, #ea580c)', border: 'none', borderRadius: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-main" style={page}>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Help & <span style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Support</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Get help with your orders, prescriptions, and account</p>
                </div>

                {/* Contact Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{ ...card, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #f97316, #ea580c)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem' }}><FiPhone /></div>
                        <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Call Us</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>1800-123-4567</div>
                            <div style={{ fontSize: '0.75rem', color: '#f97316' }}>24/7 Available</div>
                        </div>
                    </div>
                    <div style={{ ...card, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #f97316, #ea580c)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem' }}><FiMail /></div>
                        <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Email</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>support@RxHub.com</div>
                            <div style={{ fontSize: '0.75rem', color: '#f59e0b' }}>Response in 24hrs</div>
                        </div>
                    </div>
                    <div style={{ ...card, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem' }}><FiMessageCircle /></div>
                        <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Live Chat</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Chat with an agent</div>
                            <div style={{ fontSize: '0.75rem', color: '#f97316' }}>Online now</div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'inline-flex', background: 'var(--bg-secondary)', borderRadius: '0.75rem', padding: '0.375rem', gap: '0.25rem', marginBottom: '2rem', boxShadow: '0 2px 8px var(--border-light)' }}>
                    {[{ id: 'faq', label: 'FAQs', icon: <FiHelpCircle /> }, { id: 'ticket', label: 'Submit Ticket', icon: <FiSend /> }].map(tab => (
                        <button key={tab.id} onClick={() => setActiveSection(tab.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', fontSize: '0.875rem', fontWeight: 600, color: activeSection === tab.id ? '#ea580c' : 'var(--text-secondary)', background: activeSection === tab.id ? '#eff6ff' : 'transparent', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* FAQ Section */}
                {activeSection === 'faq' && (
                    <div style={card}>
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--bg-secondary)' }}>
                            <h3 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiHelpCircle style={{ color: '#f97316' }} /> Frequently Asked Questions</h3>
                        </div>
                        <div style={{ padding: '1rem' }}>
                            {faqs.map((faq, i) => (
                                <div key={i} style={{ borderBottom: i < faqs.length - 1 ? '1px solid var(--bg-secondary)' : 'none' }}>
                                    <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)} style={{ width: '100%', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{faq.q}</span>
                                        {expandedFaq === i ? <FiChevronUp style={{ color: '#f97316' }} /> : <FiChevronDown style={{ color: 'var(--text-secondary)' }} />}
                                    </button>
                                    <div style={{ maxHeight: expandedFaq === i ? '200px' : '0', overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
                                        <div style={{ padding: '0 1rem 1rem', color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>{faq.a}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Ticket Form */}
                {activeSection === 'ticket' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                        <div style={card}>
                            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--bg-secondary)' }}>
                                <h3 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiSend style={{ color: '#f97316' }} /> Create Support Ticket</h3>
                            </div>
                            <form onSubmit={handleTicketSubmit} style={{ padding: '1.5rem' }}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={label}>Subject</label>
                                    <input type="text" value={ticketForm.subject} onChange={e => setTicketForm({ ...ticketForm, subject: e.target.value })} style={input} placeholder="Brief description of your issue" required />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={label}>Category</label>
                                    <select value={ticketForm.category} onChange={e => setTicketForm({ ...ticketForm, category: e.target.value })} style={{ ...input, cursor: 'pointer' }} required>
                                        <option value="">Select category</option>
                                        <option value="order">Order Issues</option>
                                        <option value="prescription">Prescription Help</option>
                                        <option value="payment">Payment & Refunds</option>
                                        <option value="account">Account Settings</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={label}>Message</label>
                                    <textarea value={ticketForm.message} onChange={e => setTicketForm({ ...ticketForm, message: e.target.value })} style={{ ...input, minHeight: 150, resize: 'vertical' }} placeholder="Describe your issue in detail..." required />
                                </div>
                                <button type="submit" disabled={submitting} style={{ ...btn, opacity: submitting ? 0.7 : 1 }}>
                                    {submitting ? 'Submitting...' : <><FiSend /> Submit Ticket</>}
                                </button>
                            </form>
                        </div>
                        <div>
                            <div style={{ ...card, padding: '1.5rem' }}>
                                <h4 style={{ fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiClock style={{ color: '#f59e0b' }} /> Response Time</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: '0.5rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Order Issues</span>
                                        <span style={{ fontWeight: 600, color: '#f97316' }}>2-4 hours</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: '0.5rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Prescription</span>
                                        <span style={{ fontWeight: 600, color: '#f97316' }}>1-2 hours</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: '0.5rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Other</span>
                                        <span style={{ fontWeight: 600, color: '#f59e0b' }}>24 hours</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ ...card, padding: '1.5rem', marginTop: '1rem', background: 'linear-gradient(135deg, #fff7ed, #d1fae5)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                    <FiCheckCircle style={{ color: '#f97316', fontSize: '1.25rem' }} />
                                    <span style={{ fontWeight: 700, color: '#065f46' }}>Priority Support</span>
                                </div>
                                <p style={{ fontSize: '0.875rem', color: '#c2410c', lineHeight: 1.5 }}>Medical emergencies get instant priority. Call our hotline for urgent assistance.</p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Support;





