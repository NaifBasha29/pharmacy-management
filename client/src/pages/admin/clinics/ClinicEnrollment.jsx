import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiArrowLeft, FiArrowRight, FiSave, FiCheck, FiX, FiUpload,
    FiUser, FiPhone, FiMapPin, FiFileText, FiSettings, FiCreditCard,
    FiUserPlus, FiShield, FiLink, FiCheckCircle, FiLock, FiSend
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Sidebar from '../../../components/common/Sidebar';
import { clinicsAPI } from '../../../services/api';
import './ClinicEnrollment.css';

const STEPS = [
    { id: 1, title: 'Basic Info', icon: FiUser },
    { id: 2, title: 'Contact', icon: FiPhone },
    { id: 3, title: 'Address', icon: FiMapPin },
    { id: 4, title: 'Regulatory', icon: FiFileText },
    { id: 5, title: 'Operations', icon: FiSettings },
    { id: 6, title: 'Subscription', icon: FiCreditCard },
    { id: 7, title: 'Admin Account', icon: FiUserPlus },
    { id: 8, title: 'Permissions', icon: FiShield },
    { id: 9, title: 'Integration', icon: FiLink },
    { id: 10, title: 'Verification', icon: FiCheckCircle },
    { id: 11, title: 'Review', icon: FiLock }
];

const initialFormData = {
    // Section 1: Basic Info
    name: '', registrationNumber: '', type: 'retail_pharmacy',
    yearEstablished: '', website: '', taxId: '',

    // Section 2: Contact
    contact: {
        personName: '', designation: 'manager', email: '',
        phone: '', altPhone: '', supportEmail: ''
    },

    // Section 3: Address
    address: {
        line1: '', line2: '', city: '', state: '',
        country: 'India', pincode: '', mapsLink: ''
    },

    // Section 4: Regulatory
    regulatory: {
        licenseNumber: '', issuingAuthority: '', licenseValidity: '',
        drugControlId: '', complianceDeclaration: false
    },

    // Section 5: Operational
    operational: {
        workingHours: { open: '09:00', close: '21:00' },
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        orderCutoffTime: '18:00', deliverySupport: false,
        emergencyService: false, timezone: 'Asia/Kolkata', currency: 'INR'
    },

    // Section 6: Subscription
    subscription: {
        plan: 'trial', validityPeriod: '', billingCycle: 'monthly',
        maxUsers: 5, storageLimit: 1024
    },

    // Section 7: Admin Account
    adminAccount: {
        fullName: '', username: '', email: '',
        tempPassword: '', forcePasswordReset: true
    },

    // Section 8: Permissions
    permissions: {
        dashboardAccess: 'full', inventoryAccess: true,
        orderManagementAccess: true, staffManagementAccess: true,
        financialAccess: false, prescriptionApprovalAccess: true
    },

    // Section 9: Integration
    integration: {
        webhookUrl: '', thirdPartyIntegration: false,
        notificationPreferences: { email: true, sms: false, inApp: true }
    },

    // Section 10: Verification
    verification: {
        clinicStatus: 'pending_verification',
        adminAccountStatus: 'pending',
        verificationChecklist: {
            documentsVerified: false, licenseVerified: false,
            addressVerified: false, contactVerified: false
        },
        adminNotes: ''
    }
};

const ClinicEnrollment = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState(initialFormData);
    const [files, setFiles] = useState({ logo: null, licenseDocument: null });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

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

    const updateNestedFormData = (section, parent, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [parent]: { ...prev[section][parent], [field]: value }
            }
        }));
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
                if (!formData.type) newErrors.type = 'Clinic type is required';
                break;
            case 2:
                if (!formData.contact.personName) newErrors['contact.personName'] = 'Contact person name is required';
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
                if (!formData.regulatory.issuingAuthority) newErrors['regulatory.issuingAuthority'] = 'Issuing authority is required';
                if (!formData.regulatory.licenseValidity) newErrors['regulatory.licenseValidity'] = 'License validity is required';
                if (!formData.regulatory.complianceDeclaration) newErrors['regulatory.complianceDeclaration'] = 'You must accept compliance declaration';
                break;
            case 7:
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
            setCurrentStep(prev => Math.min(prev + 1, 11));
        }
    };

    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = async (action) => {
        setLoading(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('clinicData', JSON.stringify({
                ...formData,
                isDraft: action === 'draft'
            }));

            if (files.logo) formDataToSend.append('logo', files.logo);
            if (files.licenseDocument) formDataToSend.append('licenseDocument', files.licenseDocument);

            const response = await clinicsAPI.create(formDataToSend);

            if (response.data.success) {
                const clinicId = response.data.data.clinic._id;

                if (action === 'verify') {
                    await clinicsAPI.verify(clinicId, { verificationChecklist: formData.verification.verificationChecklist });
                    toast.success('Clinic verified successfully!');
                } else if (action === 'activate') {
                    await clinicsAPI.verify(clinicId, { verificationChecklist: formData.verification.verificationChecklist });
                    await clinicsAPI.activate(clinicId);
                    toast.success('Clinic activated successfully!');
                } else if (action === 'send') {
                    await clinicsAPI.verify(clinicId, { verificationChecklist: formData.verification.verificationChecklist });
                    await clinicsAPI.activate(clinicId);
                    await clinicsAPI.sendCredentials(clinicId);
                    toast.success('Clinic activated and credentials sent!');
                } else {
                    toast.success('Clinic saved as draft!');
                }

                navigate('/admin/clinics');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save clinic');
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1: return <Step1BasicInfo formData={formData} updateFormData={updateFormData} files={files} handleFileChange={handleFileChange} errors={errors} />;
            case 2: return <Step2Contact formData={formData} updateFormData={updateFormData} errors={errors} />;
            case 3: return <Step3Address formData={formData} updateFormData={updateFormData} errors={errors} />;
            case 4: return <Step4Regulatory formData={formData} updateFormData={updateFormData} files={files} handleFileChange={handleFileChange} errors={errors} />;
            case 5: return <Step5Operational formData={formData} updateFormData={updateFormData} updateNestedFormData={updateNestedFormData} />;
            case 6: return <Step6Subscription formData={formData} updateFormData={updateFormData} />;
            case 7: return <Step7AdminAccount formData={formData} updateFormData={updateFormData} generatePassword={generatePassword} errors={errors} />;
            case 8: return <Step8Permissions formData={formData} updateFormData={updateFormData} />;
            case 9: return <Step9Integration formData={formData} updateFormData={updateFormData} updateNestedFormData={updateNestedFormData} />;
            case 10: return <Step10Verification formData={formData} updateFormData={updateFormData} updateNestedFormData={updateNestedFormData} />;
            case 11: return <Step11Review formData={formData} files={files} />;
            default: return null;
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-main">
                <div className="enrollment-container">
                    <div className="enrollment-header">
                        <button className="btn-back" onClick={() => navigate('/admin/clinics')}>
                            <FiArrowLeft /> Back to Clinics
                        </button>
                        <h1>Clinic Enrollment</h1>
                        <p>Complete all sections to register a new clinic</p>
                    </div>

                    <div className="step-progress">
                        {STEPS.map((step) => (
                            <div
                                key={step.id}
                                className={`step-item ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}
                                onClick={() => setCurrentStep(step.id)}
                            >
                                <div className="step-icon">
                                    {currentStep > step.id ? <FiCheck /> : <step.icon />}
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
                                {currentStep < 11 ? (
                                    <button className="btn btn-primary" onClick={nextStep}>
                                        Next <FiArrowRight />
                                    </button>
                                ) : (
                                    <div className="action-buttons">
                                        <button className="btn btn-secondary" onClick={() => handleSubmit('draft')} disabled={loading}>
                                            <FiSave /> Save Draft
                                        </button>
                                        <button className="btn btn-warning" onClick={() => handleSubmit('verify')} disabled={loading}>
                                            <FiCheck /> Verify & Approve
                                        </button>
                                        <button className="btn btn-success" onClick={() => handleSubmit('activate')} disabled={loading}>
                                            <FiCheckCircle /> Activate
                                        </button>
                                        <button className="btn btn-primary" onClick={() => handleSubmit('send')} disabled={loading}>
                                            <FiSend /> Activate & Send Credentials
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

// Step Components
const Step1BasicInfo = ({ formData, updateFormData, files, handleFileChange, errors }) => (
    <div className="form-grid">
        <div className="form-group full-width">
            <label>Clinic Name *</label>
            <input type="text" value={formData.name} onChange={(e) => updateFormData(null, 'name', e.target.value)} className={errors.name ? 'error' : ''} />
            {errors.name && <span className="error-text">{errors.name}</span>}
        </div>
        <div className="form-group">
            <label>Registration Number *</label>
            <input type="text" value={formData.registrationNumber} onChange={(e) => updateFormData(null, 'registrationNumber', e.target.value)} className={errors.registrationNumber ? 'error' : ''} />
        </div>
        <div className="form-group">
            <label>Clinic Type *</label>
            <select value={formData.type} onChange={(e) => updateFormData(null, 'type', e.target.value)}>
                <option value="hospital_pharmacy">Hospital Pharmacy</option>
                <option value="retail_pharmacy">Retail Pharmacy</option>
                <option value="multi_specialty_clinic">Multi-specialty Clinic</option>
                <option value="diagnostic_center">Diagnostic Center</option>
            </select>
        </div>
        <div className="form-group">
            <label>Year Established</label>
            <input type="number" value={formData.yearEstablished} onChange={(e) => updateFormData(null, 'yearEstablished', e.target.value)} min="1900" max={new Date().getFullYear()} />
        </div>
        <div className="form-group">
            <label>Website</label>
            <input type="url" value={formData.website} onChange={(e) => updateFormData(null, 'website', e.target.value)} placeholder="https://" />
        </div>
        <div className="form-group">
            <label>Tax ID / GST Number</label>
            <input type="text" value={formData.taxId} onChange={(e) => updateFormData(null, 'taxId', e.target.value)} />
        </div>
        <div className="form-group">
            <label>Clinic Logo</label>
            <div className="file-upload">
                <input type="file" accept="image/*" onChange={(e) => handleFileChange('logo', e.target.files[0])} />
                <FiUpload /> {files.logo ? files.logo.name : 'Choose file'}
            </div>
        </div>
    </div>
);

const Step2Contact = ({ formData, updateFormData, errors }) => (
    <div className="form-grid">
        <div className="form-group">
            <label>Contact Person Name *</label>
            <input type="text" value={formData.contact.personName} onChange={(e) => updateFormData('contact', 'personName', e.target.value)} className={errors['contact.personName'] ? 'error' : ''} />
        </div>
        <div className="form-group">
            <label>Designation *</label>
            <select value={formData.contact.designation} onChange={(e) => updateFormData('contact', 'designation', e.target.value)}>
                <option value="owner">Owner</option>
                <option value="manager">Manager</option>
                <option value="pharmacist_in_charge">Pharmacist-in-Charge</option>
                <option value="other">Other</option>
            </select>
        </div>
        <div className="form-group">
            <label>Email Address *</label>
            <input type="email" value={formData.contact.email} onChange={(e) => updateFormData('contact', 'email', e.target.value)} className={errors['contact.email'] ? 'error' : ''} />
        </div>
        <div className="form-group">
            <label>Mobile Number *</label>
            <input type="tel" value={formData.contact.phone} onChange={(e) => updateFormData('contact', 'phone', e.target.value)} className={errors['contact.phone'] ? 'error' : ''} />
        </div>
        <div className="form-group">
            <label>Alternate Contact</label>
            <input type="tel" value={formData.contact.altPhone} onChange={(e) => updateFormData('contact', 'altPhone', e.target.value)} />
        </div>
        <div className="form-group">
            <label>Support Email</label>
            <input type="email" value={formData.contact.supportEmail} onChange={(e) => updateFormData('contact', 'supportEmail', e.target.value)} />
        </div>
    </div>
);

const Step3Address = ({ formData, updateFormData, errors }) => (
    <div className="form-grid">
        <div className="form-group full-width">
            <label>Address Line 1 *</label>
            <input type="text" value={formData.address.line1} onChange={(e) => updateFormData('address', 'line1', e.target.value)} className={errors['address.line1'] ? 'error' : ''} />
        </div>
        <div className="form-group full-width">
            <label>Address Line 2</label>
            <input type="text" value={formData.address.line2} onChange={(e) => updateFormData('address', 'line2', e.target.value)} />
        </div>
        <div className="form-group">
            <label>City *</label>
            <input type="text" value={formData.address.city} onChange={(e) => updateFormData('address', 'city', e.target.value)} className={errors['address.city'] ? 'error' : ''} />
        </div>
        <div className="form-group">
            <label>State *</label>
            <input type="text" value={formData.address.state} onChange={(e) => updateFormData('address', 'state', e.target.value)} className={errors['address.state'] ? 'error' : ''} />
        </div>
        <div className="form-group">
            <label>Country *</label>
            <input type="text" value={formData.address.country} onChange={(e) => updateFormData('address', 'country', e.target.value)} />
        </div>
        <div className="form-group">
            <label>Pincode *</label>
            <input type="text" value={formData.address.pincode} onChange={(e) => updateFormData('address', 'pincode', e.target.value)} className={errors['address.pincode'] ? 'error' : ''} />
        </div>
        <div className="form-group full-width">
            <label>Google Maps Link</label>
            <input type="url" value={formData.address.mapsLink} onChange={(e) => updateFormData('address', 'mapsLink', e.target.value)} placeholder="https://maps.google.com/..." />
        </div>
    </div>
);

const Step4Regulatory = ({ formData, updateFormData, files, handleFileChange, errors }) => (
    <div className="form-grid">
        <div className="form-group">
            <label>Pharmacy License Number *</label>
            <input type="text" value={formData.regulatory.licenseNumber} onChange={(e) => updateFormData('regulatory', 'licenseNumber', e.target.value)} className={errors['regulatory.licenseNumber'] ? 'error' : ''} />
        </div>
        <div className="form-group">
            <label>Issuing Authority *</label>
            <input type="text" value={formData.regulatory.issuingAuthority} onChange={(e) => updateFormData('regulatory', 'issuingAuthority', e.target.value)} className={errors['regulatory.issuingAuthority'] ? 'error' : ''} />
        </div>
        <div className="form-group">
            <label>License Validity Date *</label>
            <input type="date" value={formData.regulatory.licenseValidity} onChange={(e) => updateFormData('regulatory', 'licenseValidity', e.target.value)} className={errors['regulatory.licenseValidity'] ? 'error' : ''} />
        </div>
        <div className="form-group">
            <label>Drug Control Approval ID</label>
            <input type="text" value={formData.regulatory.drugControlId} onChange={(e) => updateFormData('regulatory', 'drugControlId', e.target.value)} />
        </div>
        <div className="form-group full-width">
            <label>Upload License Document *</label>
            <div className="file-upload">
                <input type="file" accept=".pdf,image/*" onChange={(e) => handleFileChange('licenseDocument', e.target.files[0])} />
                <FiUpload /> {files.licenseDocument ? files.licenseDocument.name : 'Choose file (PDF/Image)'}
            </div>
        </div>
        <div className="form-group full-width">
            <label className="checkbox-label">
                <input type="checkbox" checked={formData.regulatory.complianceDeclaration} onChange={(e) => updateFormData('regulatory', 'complianceDeclaration', e.target.checked)} />
                I declare that all information provided is accurate and compliant with regulatory requirements *
            </label>
            {errors['regulatory.complianceDeclaration'] && <span className="error-text">{errors['regulatory.complianceDeclaration']}</span>}
        </div>
    </div>
);

const Step5Operational = ({ formData, updateFormData, updateNestedFormData }) => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    const toggleDay = (day) => {
        const current = formData.operational.workingDays;
        const updated = current.includes(day) ? current.filter(d => d !== day) : [...current, day];
        updateFormData('operational', 'workingDays', updated);
    };

    return (
        <div className="form-grid">
            <div className="form-group">
                <label>Opening Time</label>
                <input type="time" value={formData.operational.workingHours.open} onChange={(e) => updateNestedFormData('operational', 'workingHours', 'open', e.target.value)} />
            </div>
            <div className="form-group">
                <label>Closing Time</label>
                <input type="time" value={formData.operational.workingHours.close} onChange={(e) => updateNestedFormData('operational', 'workingHours', 'close', e.target.value)} />
            </div>
            <div className="form-group full-width">
                <label>Working Days</label>
                <div className="day-selector">
                    {days.map(day => (
                        <button key={day} type="button" className={`day-btn ${formData.operational.workingDays.includes(day) ? 'active' : ''}`} onClick={() => toggleDay(day)}>
                            {day.slice(0, 3).toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>
            <div className="form-group">
                <label>Order Cut-off Time</label>
                <input type="time" value={formData.operational.orderCutoffTime} onChange={(e) => updateFormData('operational', 'orderCutoffTime', e.target.value)} />
            </div>
            <div className="form-group">
                <label>Timezone</label>
                <select value={formData.operational.timezone} onChange={(e) => updateFormData('operational', 'timezone', e.target.value)}>
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="UTC">UTC</option>
                </select>
            </div>
            <div className="form-group">
                <label>Currency</label>
                <select value={formData.operational.currency} onChange={(e) => updateFormData('operational', 'currency', e.target.value)}>
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                </select>
            </div>
            <div className="form-group">
                <label className="checkbox-label">
                    <input type="checkbox" checked={formData.operational.deliverySupport} onChange={(e) => updateFormData('operational', 'deliverySupport', e.target.checked)} />
                    Delivery Support
                </label>
            </div>
            <div className="form-group">
                <label className="checkbox-label">
                    <input type="checkbox" checked={formData.operational.emergencyService} onChange={(e) => updateFormData('operational', 'emergencyService', e.target.checked)} />
                    Emergency Service (24/7)
                </label>
            </div>
        </div>
    );
};

const Step6Subscription = ({ formData, updateFormData }) => (
    <div className="form-grid">
        <div className="form-group">
            <label>Subscription Plan</label>
            <select value={formData.subscription.plan} onChange={(e) => updateFormData('subscription', 'plan', e.target.value)}>
                <option value="trial">Trial (30 days)</option>
                <option value="basic">Basic</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
            </select>
        </div>
        <div className="form-group">
            <label>Billing Cycle</label>
            <select value={formData.subscription.billingCycle} onChange={(e) => updateFormData('subscription', 'billingCycle', e.target.value)}>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
            </select>
        </div>
        <div className="form-group">
            <label>Plan Validity Period</label>
            <input type="date" value={formData.subscription.validityPeriod} onChange={(e) => updateFormData('subscription', 'validityPeriod', e.target.value)} />
        </div>
        <div className="form-group">
            <label>Maximum Users Allowed</label>
            <input type="number" value={formData.subscription.maxUsers} onChange={(e) => updateFormData('subscription', 'maxUsers', parseInt(e.target.value))} min="1" />
        </div>
        <div className="form-group">
            <label>Storage Limit (MB)</label>
            <input type="number" value={formData.subscription.storageLimit} onChange={(e) => updateFormData('subscription', 'storageLimit', parseInt(e.target.value))} min="100" />
        </div>
    </div>
);

const Step7AdminAccount = ({ formData, updateFormData, generatePassword, errors }) => (
    <div className="form-grid">
        <div className="form-group">
            <label>Admin Full Name *</label>
            <input type="text" value={formData.adminAccount.fullName} onChange={(e) => updateFormData('adminAccount', 'fullName', e.target.value)} className={errors['adminAccount.fullName'] ? 'error' : ''} />
        </div>
        <div className="form-group">
            <label>Admin Username *</label>
            <input type="text" value={formData.adminAccount.username} onChange={(e) => updateFormData('adminAccount', 'username', e.target.value)} className={errors['adminAccount.username'] ? 'error' : ''} />
        </div>
        <div className="form-group">
            <label>Admin Email *</label>
            <input type="email" value={formData.adminAccount.email} onChange={(e) => updateFormData('adminAccount', 'email', e.target.value)} className={errors['adminAccount.email'] ? 'error' : ''} />
        </div>
        <div className="form-group">
            <label>Temporary Password</label>
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

const Step8Permissions = ({ formData, updateFormData }) => (
    <div className="form-grid">
        <div className="form-group">
            <label>Dashboard Access</label>
            <select value={formData.permissions.dashboardAccess} onChange={(e) => updateFormData('permissions', 'dashboardAccess', e.target.value)}>
                <option value="full">Full Access</option>
                <option value="restricted">Restricted</option>
            </select>
        </div>
        <div className="form-group permissions-grid full-width">
            <label className="checkbox-label"><input type="checkbox" checked={formData.permissions.inventoryAccess} onChange={(e) => updateFormData('permissions', 'inventoryAccess', e.target.checked)} /> Inventory Management</label>
            <label className="checkbox-label"><input type="checkbox" checked={formData.permissions.orderManagementAccess} onChange={(e) => updateFormData('permissions', 'orderManagementAccess', e.target.checked)} /> Order Management</label>
            <label className="checkbox-label"><input type="checkbox" checked={formData.permissions.staffManagementAccess} onChange={(e) => updateFormData('permissions', 'staffManagementAccess', e.target.checked)} /> Staff Management</label>
            <label className="checkbox-label"><input type="checkbox" checked={formData.permissions.financialAccess} onChange={(e) => updateFormData('permissions', 'financialAccess', e.target.checked)} /> Financial Reports</label>
            <label className="checkbox-label"><input type="checkbox" checked={formData.permissions.prescriptionApprovalAccess} onChange={(e) => updateFormData('permissions', 'prescriptionApprovalAccess', e.target.checked)} /> Prescription Approval</label>
        </div>
    </div>
);

const Step9Integration = ({ formData, updateFormData, updateNestedFormData }) => (
    <div className="form-grid">
        <div className="form-group full-width">
            <label>Webhook URL</label>
            <input type="url" value={formData.integration.webhookUrl} onChange={(e) => updateFormData('integration', 'webhookUrl', e.target.value)} placeholder="https://..." />
        </div>
        <div className="form-group">
            <label className="checkbox-label">
                <input type="checkbox" checked={formData.integration.thirdPartyIntegration} onChange={(e) => updateFormData('integration', 'thirdPartyIntegration', e.target.checked)} />
                Enable Third-party Integration
            </label>
        </div>
        <div className="form-group full-width">
            <label>Notification Preferences</label>
            <div className="notification-options">
                <label className="checkbox-label"><input type="checkbox" checked={formData.integration.notificationPreferences.email} onChange={(e) => updateNestedFormData('integration', 'notificationPreferences', 'email', e.target.checked)} /> Email</label>
                <label className="checkbox-label"><input type="checkbox" checked={formData.integration.notificationPreferences.sms} onChange={(e) => updateNestedFormData('integration', 'notificationPreferences', 'sms', e.target.checked)} /> SMS</label>
                <label className="checkbox-label"><input type="checkbox" checked={formData.integration.notificationPreferences.inApp} onChange={(e) => updateNestedFormData('integration', 'notificationPreferences', 'inApp', e.target.checked)} /> In-App</label>
            </div>
        </div>
        <div className="form-group full-width info-box">
            <p><strong>Note:</strong> API Key will be auto-generated after clinic activation.</p>
        </div>
    </div>
);

const Step10Verification = ({ formData, updateFormData, updateNestedFormData }) => (
    <div className="form-grid">
        <div className="form-group">
            <label>Clinic Status</label>
            <select value={formData.verification.clinicStatus} onChange={(e) => updateFormData('verification', 'clinicStatus', e.target.value)}>
                <option value="pending_verification">Pending Verification</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
            </select>
        </div>
        <div className="form-group">
            <label>Admin Account Status</label>
            <select value={formData.verification.adminAccountStatus} onChange={(e) => updateFormData('verification', 'adminAccountStatus', e.target.value)}>
                <option value="pending">Pending</option>
                <option value="enabled">Enabled</option>
                <option value="disabled">Disabled</option>
            </select>
        </div>
        <div className="form-group full-width">
            <label>Verification Checklist</label>
            <div className="checklist">
                <label className="checkbox-label"><input type="checkbox" checked={formData.verification.verificationChecklist.documentsVerified} onChange={(e) => updateNestedFormData('verification', 'verificationChecklist', 'documentsVerified', e.target.checked)} /> Documents Verified</label>
                <label className="checkbox-label"><input type="checkbox" checked={formData.verification.verificationChecklist.licenseVerified} onChange={(e) => updateNestedFormData('verification', 'verificationChecklist', 'licenseVerified', e.target.checked)} /> License Verified</label>
                <label className="checkbox-label"><input type="checkbox" checked={formData.verification.verificationChecklist.addressVerified} onChange={(e) => updateNestedFormData('verification', 'verificationChecklist', 'addressVerified', e.target.checked)} /> Address Verified</label>
                <label className="checkbox-label"><input type="checkbox" checked={formData.verification.verificationChecklist.contactVerified} onChange={(e) => updateNestedFormData('verification', 'verificationChecklist', 'contactVerified', e.target.checked)} /> Contact Verified</label>
            </div>
        </div>
        <div className="form-group full-width">
            <label>Admin Notes</label>
            <textarea value={formData.verification.adminNotes} onChange={(e) => updateFormData('verification', 'adminNotes', e.target.value)} rows={4} placeholder="Internal notes for review..." />
        </div>
    </div>
);

const Step11Review = ({ formData, files }) => (
    <div className="review-section">
        <div className="review-card">
            <h3>Basic Information</h3>
            <p><strong>Name:</strong> {formData.name}</p>
            <p><strong>Registration:</strong> {formData.registrationNumber}</p>
            <p><strong>Type:</strong> {formData.type.replace(/_/g, ' ')}</p>
        </div>
        <div className="review-card">
            <h3>Contact</h3>
            <p><strong>Person:</strong> {formData.contact.personName}</p>
            <p><strong>Email:</strong> {formData.contact.email}</p>
            <p><strong>Phone:</strong> {formData.contact.phone}</p>
        </div>
        <div className="review-card">
            <h3>Address</h3>
            <p>{formData.address.line1}, {formData.address.city}, {formData.address.state} - {formData.address.pincode}</p>
        </div>
        <div className="review-card">
            <h3>Regulatory</h3>
            <p><strong>License:</strong> {formData.regulatory.licenseNumber}</p>
            <p><strong>Authority:</strong> {formData.regulatory.issuingAuthority}</p>
            <p><strong>Valid Until:</strong> {formData.regulatory.licenseValidity}</p>
        </div>
        <div className="review-card">
            <h3>Admin Account</h3>
            <p><strong>Name:</strong> {formData.adminAccount.fullName}</p>
            <p><strong>Email:</strong> {formData.adminAccount.email}</p>
            <p><strong>Username:</strong> {formData.adminAccount.username}</p>
        </div>
        <div className="review-card">
            <h3>Files</h3>
            <p><strong>Logo:</strong> {files.logo ? files.logo.name : 'Not uploaded'}</p>
            <p><strong>License Doc:</strong> {files.licenseDocument ? files.licenseDocument.name : 'Not uploaded'}</p>
        </div>
    </div>
);

export default ClinicEnrollment;
