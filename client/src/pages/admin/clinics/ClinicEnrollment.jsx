import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    FiArrowLeft, FiArrowRight, FiSave, FiUpload,
    FiUser, FiPhone, FiMapPin, FiFileText, FiUserPlus, FiShield, FiCheckCircle
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Sidebar from '../../../components/common/Sidebar';
import { clinicsAPI } from '../../../services/api';
import './ClinicEnrollment.css';

const STEPS = [
    { id: 1, title: 'Basic Details', icon: FiUser },
    { id: 2, title: 'Contact Info', icon: FiPhone },
    { id: 3, title: 'Address', icon: FiMapPin },
    { id: 4, title: 'License Info', icon: FiFileText },
    { id: 5, title: 'Admin Account', icon: FiUserPlus },
    { id: 6, title: 'Status & Review', icon: FiShield }
];

const initialFormData = {
    // Section 1: Clinic Basic Details
    name: '',
    type: 'retail_pharmacy',
    registrationNumber: '',

    // Section 2: Contact Information
    contact: {
        personName: '',
        designation: 'manager',
        email: '',
        phone: ''
    },

    // Section 3: Clinic Address
    address: {
        line1: '',
        city: '',
        state: '',
        country: 'India',
        pincode: ''
    },

    // Section 4: Regulatory / License Info
    regulatory: {
        licenseNumber: '',
        issuingAuthority: 'State Pharmacy Council',
        licenseValidity: '',
        licenseDocument: ''
    },

    // Section 5: Clinic Admin Account Setup
    adminAccount: {
        fullName: '',
        username: '',
        email: '',
        tempPassword: '',
        forcePasswordReset: true
    },

    // Section 6: System Access & Status
    verification: {
        clinicStatus: 'active',
        adminAccountStatus: 'enabled',
        adminNotes: ''
    }
};

const ClinicEnrollment = () => {
    const navigate = useNavigate();
    const { id: clinicId } = useParams(); // Get clinic ID from URL for edit mode
    const isEditMode = Boolean(clinicId);

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState(initialFormData);
    const [files, setFiles] = useState({ logo: null, licenseDocument: null });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [fetchingClinic, setFetchingClinic] = useState(false);

    // Fetch clinic data if in edit mode
    useEffect(() => {
        if (isEditMode && clinicId) {
            fetchClinicData();
        }
    }, [clinicId, isEditMode]);

    const fetchClinicData = async () => {
        setFetchingClinic(true);
        try {
            const response = await clinicsAPI.getById(clinicId);
            if (response.data.success) {
                const clinic = response.data.data;
                // Format date for input field
                const formattedValidity = clinic.regulatory?.licenseValidity
                    ? new Date(clinic.regulatory.licenseValidity).toISOString().split('T')[0]
                    : '';

                setFormData({
                    name: clinic.name || '',
                    type: clinic.type || 'retail_pharmacy',
                    registrationNumber: clinic.registrationNumber || '',
                    contact: {
                        personName: clinic.contact?.personName || '',
                        designation: clinic.contact?.designation || 'manager',
                        email: clinic.contact?.email || '',
                        phone: clinic.contact?.phone || ''
                    },
                    address: {
                        line1: clinic.address?.line1 || '',
                        city: clinic.address?.city || '',
                        state: clinic.address?.state || '',
                        country: clinic.address?.country || 'India',
                        pincode: clinic.address?.pincode || ''
                    },
                    regulatory: {
                        licenseNumber: clinic.regulatory?.licenseNumber || '',
                        issuingAuthority: clinic.regulatory?.issuingAuthority || 'State Pharmacy Council',
                        licenseValidity: formattedValidity,
                        licenseDocument: clinic.regulatory?.licenseDocument || ''
                    },
                    adminAccount: {
                        fullName: clinic.adminAccount?.fullName || '',
                        username: clinic.adminAccount?.username || '',
                        email: clinic.adminAccount?.email || '',
                        tempPassword: '',
                        forcePasswordReset: clinic.adminAccount?.forcePasswordReset ?? true
                    },
                    verification: {
                        clinicStatus: clinic.verification?.clinicStatus || 'active',
                        adminAccountStatus: clinic.verification?.adminAccountStatus || 'enabled',
                        adminNotes: clinic.verification?.adminNotes || ''
                    }
                });
                toast.success('Clinic data loaded for editing');
            }
        } catch (error) {
            console.error('Failed to fetch clinic:', error);
            toast.error('Failed to load clinic data');
            navigate('/admin/clinics');
        } finally {
            setFetchingClinic(false);
        }
    };

    // Developer Autofill Function - Generates unique values each time
    const handleDevAutofill = () => {
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
        const uniqueId = `${timestamp}-${randomSuffix}`;
        const shortId = randomSuffix;

        const clinicNames = ['MediCare', 'HealthFirst', 'CureWell', 'PharmaCare', 'LifeLine', 'MedPlus'];
        const clinicSuffixes = ['Pharmacy', 'Medical Center', 'Health Store'];
        const randomClinicName = `${clinicNames[Math.floor(Math.random() * clinicNames.length)]} ${clinicSuffixes[Math.floor(Math.random() * clinicSuffixes.length)]} ${shortId}`;

        const firstNames = ['Rajesh', 'Priya', 'Amit', 'Sunita', 'Vikram', 'Anita'];
        const lastNames = ['Kumar', 'Sharma', 'Patel', 'Singh', 'Reddy', 'Gupta'];
        const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const randomFullName = `${randomFirstName} ${randomLastName}`;
        const randomPhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;

        const clinicTypes = ['retail_pharmacy', 'hospital_pharmacy', 'multi_specialty_clinic'];
        const randomType = clinicTypes[Math.floor(Math.random() * clinicTypes.length)];

        const futureYears = 2 + Math.floor(Math.random() * 4);
        const validityDate = new Date();
        validityDate.setFullYear(validityDate.getFullYear() + futureYears);
        const formattedValidity = validityDate.toISOString().split('T')[0];

        const sampleData = {
            name: randomClinicName,
            type: randomType,
            registrationNumber: `REG-${uniqueId}`,

            contact: {
                personName: randomFullName,
                designation: 'pharmacist_in_charge',
                email: `${randomFirstName.toLowerCase()}.${shortId.toLowerCase()}@clinic.com`,
                phone: randomPhone
            },

            address: {
                line1: `${Math.floor(1 + Math.random() * 500)}, Health Street, Medical Complex`,
                city: 'Bangalore',
                state: 'Karnataka',
                country: 'India',
                pincode: `56000${Math.floor(1 + Math.random() * 9)}`
            },

            regulatory: {
                licenseNumber: `KA-PHM-${uniqueId}`,
                issuingAuthority: 'Karnataka State Pharmacy Council',
                licenseValidity: formattedValidity,
                licenseDocument: `/uploads/clinics/dev-license-${shortId}.pdf`
            },

            adminAccount: {
                fullName: `Admin ${randomFullName}`,
                username: `admin_${shortId.toLowerCase()}`,
                email: `admin.${shortId.toLowerCase()}@clinic.com`,
                tempPassword: `TempPass@${shortId}!`,
                forcePasswordReset: true
            },

            verification: {
                clinicStatus: 'active',
                adminAccountStatus: 'enabled',
                adminNotes: `Auto-filled by developer (${uniqueId}) for testing.`
            }
        };

        setFormData(sampleData);
        setCurrentStep(6); // Navigate to Review step
        toast.success(`🚀 Dev Autofill Complete! Clinic: ${randomClinicName}`);
    };

    const updateFormData = (section, field, value) => {
        if (section) {
            setFormData(prev => ({
                ...prev,
                [section]: { ...prev[section], [field]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleFileChange = (field, file) => {
        setFiles(prev => ({ ...prev, [field]: file }));
    };

    const generatePassword = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        updateFormData('adminAccount', 'tempPassword', password);
    };

    const validateStep = (step) => {
        const newErrors = {};

        switch (step) {
            case 1:
                if (!formData.name) newErrors.name = 'Clinic name is required';
                if (!formData.registrationNumber) newErrors.registrationNumber = 'Registration number is required';
                break;
            case 2:
                if (!formData.contact.personName) newErrors['contact.personName'] = 'Contact person is required';
                if (!formData.contact.email) newErrors['contact.email'] = 'Email is required';
                if (!formData.contact.phone) newErrors['contact.phone'] = 'Phone is required';
                break;
            case 3:
                if (!formData.address.line1) newErrors['address.line1'] = 'Address is required';
                if (!formData.address.city) newErrors['address.city'] = 'City is required';
                if (!formData.address.state) newErrors['address.state'] = 'State is required';
                if (!formData.address.pincode) newErrors['address.pincode'] = 'Pincode is required';
                break;
            case 4:
                if (!formData.regulatory.licenseNumber) newErrors['regulatory.licenseNumber'] = 'License number is required';
                if (!formData.regulatory.licenseValidity) newErrors['regulatory.licenseValidity'] = 'License validity is required';
                break;
            case 5:
                if (!formData.adminAccount.fullName) newErrors['adminAccount.fullName'] = 'Admin name is required';
                if (!formData.adminAccount.username) newErrors['adminAccount.username'] = 'Username is required';
                if (!formData.adminAccount.email) newErrors['adminAccount.email'] = 'Admin email is required';
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 6));
        }
    };

    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = async (action) => {
        setLoading(true);
        try {
            // Set status based on action
            const clinicDataObj = {
                ...formData,
                isDraft: action === 'draft',
                verification: {
                    ...formData.verification,
                    clinicStatus: action === 'draft' ? 'inactive' : 'active',
                    adminAccountStatus: action === 'draft' ? 'pending' : 'enabled'
                }
            };

            const formDataToSend = new FormData();
            formDataToSend.append('clinicData', JSON.stringify(clinicDataObj));

            if (files.logo) formDataToSend.append('logo', files.logo);
            if (files.licenseDocument) formDataToSend.append('licenseDocument', files.licenseDocument);

            let response;
            if (isEditMode) {
                // Update existing clinic
                response = await clinicsAPI.update(clinicId, formDataToSend);
                if (response.data.success) {
                    if (action === 'activate') {
                        await clinicsAPI.activate(clinicId);
                        toast.success('Clinic updated and activated!');
                    } else {
                        toast.success('Clinic updated successfully!');
                    }
                    navigate('/admin/clinics');
                }
            } else {
                // Create new clinic
                response = await clinicsAPI.create(formDataToSend);
                if (response.data.success) {
                    const newClinicId = response.data.data.clinic._id;
                    if (action === 'activate') {
                        await clinicsAPI.activate(newClinicId);
                        toast.success('Clinic activated successfully!');
                    } else {
                        toast.success('Clinic saved as draft!');
                    }
                    navigate('/admin/clinics');
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save clinic');
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1: return <Step1BasicDetails formData={formData} updateFormData={updateFormData} files={files} handleFileChange={handleFileChange} errors={errors} />;
            case 2: return <Step2Contact formData={formData} updateFormData={updateFormData} errors={errors} />;
            case 3: return <Step3Address formData={formData} updateFormData={updateFormData} errors={errors} />;
            case 4: return <Step4License formData={formData} updateFormData={updateFormData} files={files} handleFileChange={handleFileChange} errors={errors} />;
            case 5: return <Step5AdminAccount formData={formData} updateFormData={updateFormData} generatePassword={generatePassword} errors={errors} />;
            case 6: return <Step6StatusReview formData={formData} updateFormData={updateFormData} files={files} />;
            default: return null;
        }
    };

    if (fetchingClinic) {
        return (
            <div className="dashboard-layout">
                <Sidebar />
                <main className="dashboard-main">
                    <div className="full-page-loading">
                        <div className="spinner" />
                        <p>Loading clinic data...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-main">
                <div className="enrollment-container">
                    <div className="enrollment-header">
                        <div className="header-top-row">
                            <button className="btn-back" onClick={() => navigate('/admin/clinics')}>
                                <FiArrowLeft /> Back to Clinics
                            </button>
                            {!isEditMode && (
                                <button className="btn-dev-autofill" onClick={handleDevAutofill} title="Developer: Auto-fill all fields">
                                    🚀 Dev Autofill
                                </button>
                            )}
                        </div>
                        <h1>{isEditMode ? 'Edit Clinic' : 'Clinic Enrollment'}</h1>
                        <p>{isEditMode ? 'Update clinic information' : 'Complete all sections to register a new clinic'}</p>
                    </div>

                    <div className="step-progress">
                        {STEPS.map((step) => (
                            <div
                                key={step.id}
                                className={`step-item ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}
                                onClick={() => setCurrentStep(step.id)}
                            >
                                <div className="step-icon">
                                    {currentStep > step.id ? <FiCheckCircle /> : <step.icon />}
                                </div>
                                <span className="step-title">{step.title}</span>
                            </div>
                        ))}
                    </div>

                    <div className="enrollment-form">
                        <div className="form-section">
                            <h2>{STEPS[currentStep - 1].title}</h2>
                            {renderStepContent()}
                        </div>

                        <div className="form-navigation">
                            <div className="nav-left">
                                {currentStep > 1 && (
                                    <button className="btn btn-secondary" onClick={prevStep}>
                                        <FiArrowLeft /> Previous
                                    </button>
                                )}
                            </div>
                            <div className="nav-right">
                                {currentStep < 6 ? (
                                    <button className="btn btn-primary" onClick={nextStep}>
                                        Next <FiArrowRight />
                                    </button>
                                ) : (
                                    <div className="action-buttons">
                                        <button className="btn btn-secondary" onClick={() => handleSubmit('draft')} disabled={loading}>
                                            <FiSave /> {isEditMode ? 'Save Changes' : 'Save Draft'}
                                        </button>
                                        <button className="btn btn-success" onClick={() => handleSubmit('activate')} disabled={loading}>
                                            <FiCheckCircle /> {isEditMode ? 'Update & Activate' : 'Activate'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

// Step 1: Clinic Basic Details
const Step1BasicDetails = ({ formData, updateFormData, files, handleFileChange, errors }) => (
    <div className="form-grid">
        <div className="form-group full-width">
            <label>Clinic Name *</label>
            <input type="text" value={formData.name} onChange={(e) => updateFormData(null, 'name', e.target.value)} className={errors.name ? 'error' : ''} placeholder="Enter clinic name" />
            {errors.name && <span className="error-text">{errors.name}</span>}
        </div>
        <div className="form-group">
            <label>Clinic Type *</label>
            <select value={formData.type} onChange={(e) => updateFormData(null, 'type', e.target.value)}>
                <option value="hospital_pharmacy">Hospital Pharmacy</option>
                <option value="retail_pharmacy">Retail Pharmacy</option>
                <option value="multi_specialty_clinic">Multi-specialty Clinic</option>
            </select>
        </div>
        <div className="form-group">
            <label>Registration / License Number *</label>
            <input type="text" value={formData.registrationNumber} onChange={(e) => updateFormData(null, 'registrationNumber', e.target.value)} className={errors.registrationNumber ? 'error' : ''} placeholder="Enter registration number" />
            {errors.registrationNumber && <span className="error-text">{errors.registrationNumber}</span>}
        </div>
        <div className="form-group">
            <label>Clinic Logo (Optional)</label>
            <div className="file-upload">
                <input type="file" accept="image/*" onChange={(e) => handleFileChange('logo', e.target.files[0])} />
                <FiUpload /> {files.logo ? files.logo.name : 'Choose file'}
            </div>
        </div>
    </div>
);

// Step 2: Contact Information
const Step2Contact = ({ formData, updateFormData, errors }) => (
    <div className="form-grid">
        <div className="form-group full-width">
            <label>Contact Person Name *</label>
            <input type="text" value={formData.contact.personName} onChange={(e) => updateFormData('contact', 'personName', e.target.value)} className={errors['contact.personName'] ? 'error' : ''} placeholder="Enter contact person name" />
            {errors['contact.personName'] && <span className="error-text">{errors['contact.personName']}</span>}
        </div>
        <div className="form-group">
            <label>Email Address *</label>
            <input type="email" value={formData.contact.email} onChange={(e) => updateFormData('contact', 'email', e.target.value)} className={errors['contact.email'] ? 'error' : ''} placeholder="Enter email address" />
            {errors['contact.email'] && <span className="error-text">{errors['contact.email']}</span>}
        </div>
        <div className="form-group">
            <label>Mobile Number *</label>
            <input type="tel" value={formData.contact.phone} onChange={(e) => updateFormData('contact', 'phone', e.target.value)} className={errors['contact.phone'] ? 'error' : ''} placeholder="Enter mobile number" />
            {errors['contact.phone'] && <span className="error-text">{errors['contact.phone']}</span>}
        </div>
    </div>
);

// Step 3: Clinic Address
const Step3Address = ({ formData, updateFormData, errors }) => (
    <div className="form-grid">
        <div className="form-group full-width">
            <label>Address Line *</label>
            <input type="text" value={formData.address.line1} onChange={(e) => updateFormData('address', 'line1', e.target.value)} className={errors['address.line1'] ? 'error' : ''} placeholder="Enter full address" />
            {errors['address.line1'] && <span className="error-text">{errors['address.line1']}</span>}
        </div>
        <div className="form-group">
            <label>City *</label>
            <input type="text" value={formData.address.city} onChange={(e) => updateFormData('address', 'city', e.target.value)} className={errors['address.city'] ? 'error' : ''} placeholder="Enter city" />
            {errors['address.city'] && <span className="error-text">{errors['address.city']}</span>}
        </div>
        <div className="form-group">
            <label>State *</label>
            <input type="text" value={formData.address.state} onChange={(e) => updateFormData('address', 'state', e.target.value)} className={errors['address.state'] ? 'error' : ''} placeholder="Enter state" />
            {errors['address.state'] && <span className="error-text">{errors['address.state']}</span>}
        </div>
        <div className="form-group">
            <label>Country *</label>
            <input type="text" value={formData.address.country} onChange={(e) => updateFormData('address', 'country', e.target.value)} placeholder="Enter country" />
        </div>
        <div className="form-group">
            <label>Pincode / ZIP *</label>
            <input type="text" value={formData.address.pincode} onChange={(e) => updateFormData('address', 'pincode', e.target.value)} className={errors['address.pincode'] ? 'error' : ''} placeholder="Enter pincode" />
            {errors['address.pincode'] && <span className="error-text">{errors['address.pincode']}</span>}
        </div>
    </div>
);

// Step 4: Regulatory / License Info
const Step4License = ({ formData, updateFormData, files, handleFileChange, errors }) => (
    <div className="form-grid">
        <div className="form-group">
            <label>Pharmacy License Number *</label>
            <input type="text" value={formData.regulatory.licenseNumber} onChange={(e) => updateFormData('regulatory', 'licenseNumber', e.target.value)} className={errors['regulatory.licenseNumber'] ? 'error' : ''} placeholder="Enter license number" />
            {errors['regulatory.licenseNumber'] && <span className="error-text">{errors['regulatory.licenseNumber']}</span>}
        </div>
        <div className="form-group">
            <label>License Validity Date *</label>
            <input type="date" value={formData.regulatory.licenseValidity} onChange={(e) => updateFormData('regulatory', 'licenseValidity', e.target.value)} className={errors['regulatory.licenseValidity'] ? 'error' : ''} />
            {errors['regulatory.licenseValidity'] && <span className="error-text">{errors['regulatory.licenseValidity']}</span>}
        </div>
        <div className="form-group full-width">
            <label>Upload License Document *</label>
            <div className="file-upload">
                <input type="file" accept=".pdf,image/*" onChange={(e) => handleFileChange('licenseDocument', e.target.files[0])} />
                <FiUpload /> {files.licenseDocument ? files.licenseDocument.name : 'Choose file (PDF/Image)'}
            </div>
        </div>
    </div>
);

// Step 5: Clinic Admin Account Setup
const Step5AdminAccount = ({ formData, updateFormData, generatePassword, errors }) => (
    <div className="form-grid">
        <div className="form-group">
            <label>Admin Full Name *</label>
            <input type="text" value={formData.adminAccount.fullName} onChange={(e) => updateFormData('adminAccount', 'fullName', e.target.value)} className={errors['adminAccount.fullName'] ? 'error' : ''} placeholder="Enter admin full name" />
            {errors['adminAccount.fullName'] && <span className="error-text">{errors['adminAccount.fullName']}</span>}
        </div>
        <div className="form-group">
            <label>Username *</label>
            <input type="text" value={formData.adminAccount.username} onChange={(e) => updateFormData('adminAccount', 'username', e.target.value)} className={errors['adminAccount.username'] ? 'error' : ''} placeholder="Enter username" />
            {errors['adminAccount.username'] && <span className="error-text">{errors['adminAccount.username']}</span>}
        </div>
        <div className="form-group">
            <label>Admin Email *</label>
            <input type="email" value={formData.adminAccount.email} onChange={(e) => updateFormData('adminAccount', 'email', e.target.value)} className={errors['adminAccount.email'] ? 'error' : ''} placeholder="Enter admin email" />
            {errors['adminAccount.email'] && <span className="error-text">{errors['adminAccount.email']}</span>}
        </div>
        <div className="form-group">
            <label>Temporary Password *</label>
            <div className="password-field">
                <input type="text" value={formData.adminAccount.tempPassword} onChange={(e) => updateFormData('adminAccount', 'tempPassword', e.target.value)} placeholder="Auto-generate or enter manually" />
                <button type="button" className="btn-generate" onClick={generatePassword}>Generate</button>
            </div>
        </div>
        <div className="form-group full-width">
            <label className="checkbox-label">
                <input type="checkbox" checked={formData.adminAccount.forcePasswordReset} onChange={(e) => updateFormData('adminAccount', 'forcePasswordReset', e.target.checked)} />
                Force Password Reset on First Login
            </label>
        </div>
    </div>
);

// Step 6: System Access & Status + Review
const Step6StatusReview = ({ formData, updateFormData, files }) => (
    <div className="form-grid">
        {/* Status Controls */}
        <div className="form-group">
            <label>Clinic Status</label>
            <select value={formData.verification.clinicStatus} onChange={(e) => updateFormData('verification', 'clinicStatus', e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
            </select>
        </div>
        <div className="form-group">
            <label>Account Verification Status</label>
            <select value={formData.verification.adminAccountStatus} onChange={(e) => updateFormData('verification', 'adminAccountStatus', e.target.value)}>
                <option value="enabled">Enabled</option>
                <option value="pending">Pending</option>
            </select>
        </div>
        <div className="form-group full-width">
            <label>Internal Admin Notes (Optional)</label>
            <textarea value={formData.verification.adminNotes} onChange={(e) => updateFormData('verification', 'adminNotes', e.target.value)} rows={3} placeholder="Internal notes for review..." />
        </div>

        {/* Review Summary */}
        <div className="form-group full-width">
            <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: '#0d9488' }}>📋 Review Summary</h3>
        </div>
        <div className="review-section full-width">
            <div className="review-card">
                <h4>Clinic Details</h4>
                <p><strong>Name:</strong> {formData.name || '-'}</p>
                <p><strong>Type:</strong> {formData.type?.replace(/_/g, ' ') || '-'}</p>
                <p><strong>Registration:</strong> {formData.registrationNumber || '-'}</p>
            </div>
            <div className="review-card">
                <h4>Contact</h4>
                <p><strong>Person:</strong> {formData.contact.personName || '-'}</p>
                <p><strong>Email:</strong> {formData.contact.email || '-'}</p>
                <p><strong>Phone:</strong> {formData.contact.phone || '-'}</p>
            </div>
            <div className="review-card">
                <h4>Address</h4>
                <p>{formData.address.line1 || '-'}, {formData.address.city || '-'}</p>
                <p>{formData.address.state || '-'}, {formData.address.country || '-'} - {formData.address.pincode || '-'}</p>
            </div>
            <div className="review-card">
                <h4>License</h4>
                <p><strong>Number:</strong> {formData.regulatory.licenseNumber || '-'}</p>
                <p><strong>Valid Until:</strong> {formData.regulatory.licenseValidity || '-'}</p>
                <p><strong>Document:</strong> {files.licenseDocument ? files.licenseDocument.name : 'Not uploaded'}</p>
            </div>
            <div className="review-card">
                <h4>Admin Account</h4>
                <p><strong>Name:</strong> {formData.adminAccount.fullName || '-'}</p>
                <p><strong>Username:</strong> {formData.adminAccount.username || '-'}</p>
                <p><strong>Email:</strong> {formData.adminAccount.email || '-'}</p>
            </div>
        </div>
    </div>
);

export default ClinicEnrollment;
