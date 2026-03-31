import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import { patientsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import './ClinicDashboard.css';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const res = await patientsAPI.getAll({ limit: 50 });
        setPatients(res.data.data.patients || []);
      } catch (err) {
        console.error('Failed to load patients', err);
        toast.error(err.response?.data?.message || 'Unable to load patients');
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  return (
    <div className="clinic-dashboard">
      <aside className="clinic-sidebar">
        <Sidebar />
      </aside>
      <main className="clinic-main">
        <header className="clinic-header">
          <h1>Patients</h1>
          <p>Patient list and records</p>
        </header>

        <div className="card">
          <div className="card-header"><h3 className="card-title">All Patients</h3></div>
          <div className="card-body">
            {loading ? (
              <p>Loading...</p>
            ) : patients.length === 0 ? (
              <p className="text-secondary">No patients found or you do not have access.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr><th>Name</th><th>Phone</th><th>Patient ID</th><th>Created</th></tr>
                </thead>
                <tbody>
                  {patients.map(p => (
                    <tr key={p._id}><td>{p.name}</td><td>{p.phone}</td><td>{p.patientId}</td><td>{new Date(p.createdAt).toLocaleDateString()}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Patients;
