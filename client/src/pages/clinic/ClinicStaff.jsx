import React, { useEffect, useState } from "react";
import Sidebar from "../../components/common/Sidebar";
import { usersAPI } from "../../services/api";
import toast from "react-hot-toast";
import "./ClinicDashboard.css";

const ClinicStaff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await usersAPI.getAll({ role: "pharmacist", limit: 50 });
        setStaff(res.data.data.users || []);
      } catch (err) {
        console.error("Failed to load staff", err);
        toast.error("Failed to load staff");
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
          <h1>Staff</h1>
          <p>Manage clinic staff and roles</p>
        </header>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Staff Members</h3>
          </div>
          <div className="card-body">
            {loading ? (
              <p>Loading...</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((s) => (
                    <tr key={s._id}>
                      <td>{s.name}</td>
                      <td>{s.email}</td>
                      <td>{s.role}</td>
                    </tr>
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

export default ClinicStaff;
