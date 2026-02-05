import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiPhone, FiMapPin, FiFileText, FiUserPlus, FiShield, FiCalendar, FiMail, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import TopNav from '../../../components/common/TopNav';
import { clinicsAPI } from '../../../services/api';
import './ClinicView.css';

const ClinicView = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [clinic, setClinic] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClinic();
    }, [id]);

    const fetchClinic = async () => {
        try {
            setLoading(true);
            const response = await clinicsAPI.getById(id);
            if (response.data.success) {
                setClinic(response.data.data.clinic);
            }
        } catch (error) {
            console.error('Failed to fetch clinic:', error);
            toast.error('Failed to load clinic data');
            navigate('/admin/clinics');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="dashboard-layout">
                <TopNav />
                <main className="dashboard-main">
                    <div className="full-page-loading">
                        <div className="spinner" />
                        <p>Loading clinic details...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (!clinic) {
        return (
            <div className="dashboard-layout">
                <TopNav />
                <main className="dashboard-main">
                    <div className="empty-state">
                        <p>Clinic not found</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            <TopNav />
            <main className="dashboard-main">
                <div className="clinic-view-container">
                    {/* Header */}
                    <div className="view-header">
                        <button className="btn-back" onClick={() => navigate('/admin/clinics')}>
                            <FiArrowLeft /> Back to Clinics
                        </button>
                        <div className="header-info">
                            <h1>{clinic.name}</h1>
                            <div className="header-meta">
                                <span className="clinic-code-badge">{clinic.code}</span>
                                <span className={`status-badge ${clinic.verification?.clinicStatus?.replace('_', '-')}`}>
                                    {clinic.verification?.clinicStatus?.replace('_', ' ') || 'pending'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="view-grid">
                        {/* Basic Details */}
                        <div className="view-card">
                            <div className="card-header-view">
                                <FiUser className="card-icon" />
                                <h3>Basic Details</h3>
                            </div>
                            <div className="card-body-view">
                                <div className="detail-row">
                                    <span className="label">Clinic Name</span>
                                    <span className="value">{clinic.name}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Clinic Type</span>
                                    <span className="value">{clinic.type?.replace('_', ' ')}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Registration No.</span>
                                    <span className="value mono">{clinic.registrationNumber}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Clinic Code</span>
                                    <span className="value mono">{clinic.code}</span>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="view-card">
                            <div className="card-header-view">
                                <FiPhone className="card-icon" />
                                <h3>Contact Information</h3>
                            </div>
                            <div className="card-body-view">
                                <div className="detail-row">
                                    <span className="label">Contact Person</span>
                                    <span className="value">{clinic.contact?.personName || 'N/A'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Designation</span>
                                    <span className="value">{clinic.contact?.designation?.replace('_', ' ') || 'N/A'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Email</span>
                                    <span className="value">{clinic.contact?.email || 'N/A'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Phone</span>
                                    <span className="value">{clinic.contact?.phone || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="view-card">
                            <div className="card-header-view">
                                <FiMapPin className="card-icon" />
                                <h3>Clinic Address</h3>
                            </div>
                            <div className="card-body-view">
                                <div className="detail-row">
                                    <span className="label">Address</span>
                                    <span className="value">{clinic.address?.line1 || 'N/A'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">City</span>
                                    <span className="value">{clinic.address?.city || 'N/A'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">State</span>
                                    <span className="value">{clinic.address?.state || 'N/A'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Country</span>
                                    <span className="value">{clinic.address?.country || 'India'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Pincode</span>
                                    <span className="value mono">{clinic.address?.pincode || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        {/* License Info */}
                        <div className="view-card">
                            <div className="card-header-view">
                                <FiFileText className="card-icon" />
                                <h3>License / Regulatory</h3>
                            </div>
                            <div className="card-body-view">
                                <div className="detail-row">
                                    <span className="label">License Number</span>
                                    <span className="value mono">{clinic.regulatory?.licenseNumber || 'N/A'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Issuing Authority</span>
                                    <span className="value">{clinic.regulatory?.issuingAuthority || 'N/A'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Valid Until</span>
                                    <span className="value">{formatDate(clinic.regulatory?.licenseValidity)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Admin Account */}
                        <div className="view-card">
                            <div className="card-header-view">
                                <FiUserPlus className="card-icon" />
                                <h3>Admin Account</h3>
                            </div>
                            <div className="card-body-view">
                                <div className="detail-row">
                                    <span className="label">Admin Name</span>
                                    <span className="value">{clinic.adminAccount?.fullName || 'N/A'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Username</span>
                                    <span className="value mono">{clinic.adminAccount?.username || 'N/A'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Admin Email</span>
                                    <span className="value">{clinic.adminAccount?.email || 'N/A'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Force Password Reset</span>
                                    <span className="value">{clinic.adminAccount?.forcePasswordReset ? 'Yes' : 'No'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Status & Verification */}
                        <div className="view-card">
                            <div className="card-header-view">
                                <FiShield className="card-icon" />
                                <h3>Status & Verification</h3>
                            </div>
                            <div className="card-body-view">
                                <div className="detail-row">
                                    <span className="label">Clinic Status</span>
                                    <span className={`value status-text ${clinic.verification?.clinicStatus}`}>
                                        {clinic.verification?.clinicStatus?.replace('_', ' ') || 'N/A'}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Account Status</span>
                                    <span className="value">{clinic.verification?.adminAccountStatus || 'N/A'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Is Draft</span>
                                    <span className="value">{clinic.isDraft ? 'Yes' : 'No'}</span>
                                </div>
                                {clinic.verification?.adminNotes && (
                                    <div className="detail-row full-width">
                                        <span className="label">Admin Notes</span>
                                        <span className="value notes">{clinic.verification.adminNotes}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Timestamps */}
                        <div className="view-card full-width">
                            <div className="card-header-view">
                                <FiClock className="card-icon" />
                                <h3>Timestamps</h3>
                            </div>
                            <div className="card-body-view horizontal">
                                <div className="detail-row">
                                    <span className="label">Created At</span>
                                    <span className="value">{formatDate(clinic.createdAt)}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Last Updated</span>
                                    <span className="value">{formatDate(clinic.updatedAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ClinicView;




