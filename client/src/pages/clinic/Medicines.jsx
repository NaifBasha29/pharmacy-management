import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import { medicinesAPI } from '../../services/api';
import toast from 'react-hot-toast';
import './ClinicDashboard.css';

const Medicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await medicinesAPI.getAll({ limit: 50 });
        setMedicines(res.data.data.medicines || []);
      } catch (err) {
        console.error('Failed to load medicines', err);
        toast.error('Failed to load medicines');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="clinic-dashboard">
      <aside className="clinic-sidebar">
        <Sidebar />
      </aside>
      <main className="clinic-main">
        <header className="clinic-header">
          <h1>Medicines</h1>
          <p>Clinic medicine catalog</p>
        </header>

        <div className="card">
          <div className="card-header"><h3 className="card-title">Medicines</h3></div>
          <div className="card-body">
            {loading ? <p>Loading...</p> : (
              <div className="table-container">
                <table className="table">
                  <thead><tr><th>Name</th><th>Stock</th><th>Price</th></tr></thead>
                  <tbody>
                    {medicines.map(m => (
                      <tr key={m._id}><td>{m.name}</td><td>{m.stock}</td><td>₹{m.price?.toFixed?.(2) ?? m.price}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Medicines;
