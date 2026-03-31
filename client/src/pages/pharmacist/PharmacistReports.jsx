import React, { useEffect, useState } from "react";
import Sidebar from "../../components/common/Sidebar";
import "../admin/Dashboard.css";
import { analyticsAPI } from "../../services/api";
import toast from "react-hot-toast";

const PharmacistReports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await analyticsAPI.getDashboard();
      setData(res.data.data || res.data || {});
    } catch (err) {
      console.error(err);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>Reports</h1>
            <p>Sales and inventory reports</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Overview</h3>
          </div>
          <div className="card-body">
            {loading ? (
              <p>Loading...</p>
            ) : (
              <pre style={{ whiteSpace: "pre-wrap" }}>
                {JSON.stringify(data, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PharmacistReports;
