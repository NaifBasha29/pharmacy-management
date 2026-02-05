import { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiUser } from 'react-icons/fi';
import { patientsAPI } from '../../services/api';
import Sidebar from '../../components/common/Sidebar';
import { toast } from 'react-hot-toast';
import '../admin/Dashboard.css';

const Patients = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        gender: 'male',
        dateOfBirth: '',
        password: '' // Added password field
    });

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const response = await patientsAPI.getAll();
            if (response.data.success) {
                setPatients(response.data.data.patients);
            }
        } catch (error) {
            console.error('Failed to fetch patients:', error);
            toast.error('Failed to load patients');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await patientsAPI.create(formData);
            if (response.data.success) {
                toast.success(`Patient created! ID: ${response.data.data.patient.patientId}`);
                setShowModal(false);
                setFormData({ name: '', phone: '', gender: 'male', dateOfBirth: '', password: '' });
                fetchPatients();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create patient');
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-main">
                <div className="dashboard-header">
                    <h1>Patient Management</h1>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <FiPlus /> Add Patient
                    </button>
                </div>

                {/* Patient List */}
                <div className="card">
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Patient ID</th>
                                    <th>Name</th>
                                    <th>Phone</th>
                                    <th>Gender</th>
                                    <th>Age</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" className="text-center">Loading...</td></tr>
                                ) : patients.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center">No patients found</td></tr>
                                ) : (
                                    patients.map(patient => (
                                        <tr key={patient._id}>
                                            <td>{patient.patientId}</td>
                                            <td>{patient.name}</td>
                                            <td>{patient.phone}</td>
                                            <td>{patient.gender}</td>
                                            <td>{patient.age || 'N/A'}</td>
                                            <td>
                                                <button className="btn-icon"><FiEdit2 /></button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Create Modal */}
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>Add New Patient</h2>
                                <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
                            </div>
                            <form onSubmit={handleSubmit} className="modal-body">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Date of Birth</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={formData.dateOfBirth}
                                        onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Gender</label>
                                    <select
                                        className="form-input"
                                        value={formData.gender}
                                        onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input
                                        type="tel"
                                        className="form-input"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Password (for Patient Login)</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="Create a login password"
                                        required
                                        minLength={6}
                                    />
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Create Patient</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Patients;




