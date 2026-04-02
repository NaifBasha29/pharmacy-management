import { useState, useEffect } from 'react';
import { FiSave, FiRefreshCw, FiSettings, FiShield, FiMail, FiGlobe } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { settingsAPI } from '../../../services/api';
import TopNav from '../../../components/common/TopNav';
import './AdminSettings.css';

const AdminSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        general: {
            siteName: 'RxPlus',
            siteEmail: 'admin@RxPlus.com',
            timezone: 'Asia/Kolkata',
            currency: 'INR'
        },
        security: {
            sessionTimeout: 30,
            maxLoginAttempts: 5,
            requireMFA: false,
            passwordExpiry: 90
        },
        notifications: {
            emailNotifications: true,
            orderNotifications: true,
            lowStockAlerts: true,
            systemAlerts: true
        },
        features: {
            enableOrders: true,
            enablePrescriptions: true,
            enablePatientPortal: true,
            maintenanceMode: false
        }
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const response = await settingsAPI.get();
            if (response.data.success && response.data.data) {
                setSettings(prev => ({ ...prev, ...response.data.data }));
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (section, key, value) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value
            }
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await settingsAPI.update(settings);
            toast.success('Settings saved successfully');
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="full-page-loading">
                <div className="spinner" />
                <p>Loading settings...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            <TopNav />
            <main className="dashboard-main">
                <div className="page-header">
                    <div className="header-content">
                        <h1>Settings</h1>
                        <p>Configure system preferences</p>
                    </div>
                    <div className="header-actions">
                        <button className="btn btn-outline" onClick={fetchSettings}>
                            <FiRefreshCw /> Reset
                        </button>
                        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                            <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>

                <div className="settings-grid">
                    {/* General Settings */}
                    <div className="settings-card">
                        <div className="settings-card-header">
                            <FiGlobe />
                            <h3>General Settings</h3>
                        </div>
                        <div className="settings-card-body">
                            <div className="form-group">
                                <label>Site Name</label>
                                <input
                                    type="text"
                                    value={settings.general.siteName}
                                    onChange={(e) => handleChange('general', 'siteName', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Admin Email</label>
                                <input
                                    type="email"
                                    value={settings.general.siteEmail}
                                    onChange={(e) => handleChange('general', 'siteEmail', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Timezone</label>
                                <select
                                    value={settings.general.timezone}
                                    onChange={(e) => handleChange('general', 'timezone', e.target.value)}
                                >
                                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                                    <option value="UTC">UTC</option>
                                    <option value="America/New_York">America/New_York (EST)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Security Settings */}
                    <div className="settings-card">
                        <div className="settings-card-header">
                            <FiShield />
                            <h3>Security</h3>
                        </div>
                        <div className="settings-card-body">
                            <div className="form-group">
                                <label>Session Timeout (minutes)</label>
                                <input
                                    type="number"
                                    value={settings.security.sessionTimeout}
                                    onChange={(e) => handleChange('security', 'sessionTimeout', parseInt(e.target.value))}
                                />
                            </div>
                            <div className="form-group">
                                <label>Max Login Attempts</label>
                                <input
                                    type="number"
                                    value={settings.security.maxLoginAttempts}
                                    onChange={(e) => handleChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                                />
                            </div>
                            <div className="form-group toggle-group">
                                <label>Require MFA</label>
                                <input
                                    type="checkbox"
                                    checked={settings.security.requireMFA}
                                    onChange={(e) => handleChange('security', 'requireMFA', e.target.checked)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Notification Settings */}
                    <div className="settings-card">
                        <div className="settings-card-header">
                            <FiMail />
                            <h3>Notifications</h3>
                        </div>
                        <div className="settings-card-body">
                            <div className="form-group toggle-group">
                                <label>Email Notifications</label>
                                <input
                                    type="checkbox"
                                    checked={settings.notifications.emailNotifications}
                                    onChange={(e) => handleChange('notifications', 'emailNotifications', e.target.checked)}
                                />
                            </div>
                            <div className="form-group toggle-group">
                                <label>Order Notifications</label>
                                <input
                                    type="checkbox"
                                    checked={settings.notifications.orderNotifications}
                                    onChange={(e) => handleChange('notifications', 'orderNotifications', e.target.checked)}
                                />
                            </div>
                            <div className="form-group toggle-group">
                                <label>Low Stock Alerts</label>
                                <input
                                    type="checkbox"
                                    checked={settings.notifications.lowStockAlerts}
                                    onChange={(e) => handleChange('notifications', 'lowStockAlerts', e.target.checked)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Feature Toggles */}
                    <div className="settings-card">
                        <div className="settings-card-header">
                            <FiSettings />
                            <h3>Features</h3>
                        </div>
                        <div className="settings-card-body">
                            <div className="form-group toggle-group">
                                <label>Enable Orders</label>
                                <input
                                    type="checkbox"
                                    checked={settings.features.enableOrders}
                                    onChange={(e) => handleChange('features', 'enableOrders', e.target.checked)}
                                />
                            </div>
                            <div className="form-group toggle-group">
                                <label>Enable Prescriptions</label>
                                <input
                                    type="checkbox"
                                    checked={settings.features.enablePrescriptions}
                                    onChange={(e) => handleChange('features', 'enablePrescriptions', e.target.checked)}
                                />
                            </div>
                            <div className="form-group toggle-group danger">
                                <label>Maintenance Mode</label>
                                <input
                                    type="checkbox"
                                    checked={settings.features.maintenanceMode}
                                    onChange={(e) => handleChange('features', 'maintenanceMode', e.target.checked)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminSettings;





