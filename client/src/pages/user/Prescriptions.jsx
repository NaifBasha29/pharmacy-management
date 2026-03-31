import { useState, useEffect } from 'react';
import { prescriptionsAPI } from '../../services/api';
import Sidebar from '../../components/common/Sidebar';
import { FiUpload, FiClock, FiCheckCircle, FiXCircle, FiX, FiImage } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Prescriptions = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => { fetchPrescriptions(); }, []);

    const fetchPrescriptions = async () => {
        try {
            const response = await prescriptionsAPI.getAll();
            setPrescriptions(response.data.data.prescriptions);
        } catch (error) {
            toast.error('Failed to load prescriptions');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { toast.error('File too large'); return; }
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreviewUrl(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) return;
        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('prescription', selectedFile);
            if (e.target.note?.value) formData.append('note', e.target.note.value);
            await prescriptionsAPI.upload(formData);
            toast.success('Uploaded!');
            setSelectedFile(null); setPreviewUrl(null); e.target.reset();
            fetchPrescriptions();
        } catch (error) {
            toast.error('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const page = { background: 'var(--bg-primary)', minHeight: '100vh', padding: '2rem' };
    const card = { background: 'var(--bg-secondary)', borderRadius: '1rem', boxShadow: '0 2px 8px var(--border-light)', overflow: 'hidden' };
    const badge = (s) => ({ padding: '0.25rem 0.625rem', fontSize: '0.7rem', fontWeight: 600, borderRadius: '9999px', background: s === 'approved' ? '#dcfce7' : s === 'rejected' ? '#fee2e2' : '#fef3c7', color: s === 'approved' ? '#16a34a' : s === 'rejected' ? '#dc2626' : '#d97706' });

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-main" style={page}>
                <div style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>My <span style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Prescriptions</span></h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Upload and manage your prescriptions</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '2rem' }}>
                    {/* Upload */}
                    <div style={card}>
                        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--bg-secondary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', borderRadius: '0.625rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><FiUpload /></div>
                            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Upload New</span>
                        </div>
                        <form onSubmit={handleUpload} style={{ padding: '1.5rem' }}>
                            <div style={{ border: '2px dashed var(--border-light)', borderRadius: '0.75rem', padding: previewUrl ? 0 : '2rem', textAlign: 'center', background: 'var(--bg-tertiary)', position: 'relative', cursor: 'pointer' }}>
                                <input type="file" accept="image/*,.pdf" onChange={handleFileSelect} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} required={!selectedFile} />
                                {previewUrl ? (
                                    <>
                                        <img src={previewUrl} alt="Preview" style={{ width: '100%', height: 180, objectFit: 'contain' }} />
                                        <button type="button" onClick={() => { setSelectedFile(null); setPreviewUrl(null); }} style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer' }}><FiX size={14} /></button>
                                    </>
                                ) : (
                                    <>
                                        <div style={{ width: 56, height: 56, background: '#f3e8ff', borderRadius: '50%', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6', fontSize: '1.5rem' }}><FiImage /></div>
                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Click to upload</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Images or PDF (Max 5MB)</div>
                                    </>
                                )}
                            </div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', margin: '1rem 0 0.5rem' }}>Note (Optional)</label>
                            <textarea name="note" style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-light)', borderRadius: '0.75rem', minHeight: 70, background: 'var(--bg-tertiary)' }} placeholder="Instructions..." />
                            <button type="submit" disabled={!selectedFile || uploading} style={{ width: '100%', marginTop: '1rem', padding: '0.875rem', fontWeight: 600, color: 'white', background: (!selectedFile || uploading) ? '#d1d5db' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)', border: 'none', borderRadius: '0.75rem', cursor: (!selectedFile || uploading) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                {uploading ? 'Uploading...' : <><FiUpload /> Upload</>}
                            </button>
                        </form>
                    </div>

                    {/* History */}
                    <div style={card}>
                        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiClock style={{ color: 'var(--text-secondary)' }} /> History</span>
                            <span style={{ fontSize: '0.8rem', background: 'var(--bg-secondary)', padding: '0.25rem 0.75rem', borderRadius: '9999px' }}>{prescriptions.length} Records</span>
                        </div>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner" style={{ width: 40, height: 40, margin: '0 auto' }} /></div>
                        ) : prescriptions.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', padding: '1.5rem' }}>
                                {prescriptions.map(p => (
                                    <div key={p._id} style={{ background: 'var(--bg-tertiary)', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                                        <img src={p.imageUrl || "https://placehold.co/400x160?text=Rx"} alt="Rx" style={{ width: '100%', height: 140, objectFit: 'cover' }} />
                                        <div style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span style={badge(p.status)}>{p.status === 'approved' ? <FiCheckCircle /> : p.status === 'rejected' ? <FiXCircle /> : <FiClock />} {p.status}</span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(p.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            {p.pharmacistNote && <div style={{ fontSize: '0.8rem', background: '#eff6ff', padding: '0.5rem', borderRadius: '0.5rem', borderLeft: '3px solid #f97316' }}>{p.pharmacistNote}</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '4rem' }}>
                                <div style={{ fontSize: '3rem', opacity: 0.3, marginBottom: '1rem' }}>📄</div>
                                <p style={{ color: 'var(--text-secondary)' }}>No prescriptions yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Prescriptions;




