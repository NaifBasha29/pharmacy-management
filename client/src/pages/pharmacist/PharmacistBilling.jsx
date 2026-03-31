import React, { useEffect, useState } from "react";
import Sidebar from "../../components/common/Sidebar";
import "../admin/Dashboard.css";
import { ordersAPI } from "../../services/api";
import toast from "react-hot-toast";

const PharmacistBilling = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      // Use orders as invoice source when invoices API is not available
      const res = await ordersAPI.getAll({ status: "completed", limit: 50 });
      const list = res.data.data?.orders || res.data.data || [];
      setInvoices(list);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load billing data");
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
            <h1>Billing</h1>
            <p>Invoices and payment records</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Invoices</h3>
          </div>
          <div className="card-body">
            {loading ? (
              <p>Loading...</p>
            ) : invoices.length === 0 ? (
              <p className="text-secondary">No invoices found</p>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Patient</th>
                      <th>Total</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv._id}>
                        <td>{inv._id}</td>
                        <td>{inv.patient?.name || inv.user?.name || "-"}</td>
                        <td>
                          ₹
                          {(inv.total || 0).toFixed
                            ? inv.total.toFixed(2)
                            : inv.total}
                        </td>
                        <td>
                          {inv.createdAt
                            ? new Date(inv.createdAt).toLocaleDateString()
                            : "-"}
                        </td>
                        <td>{inv.status}</td>
                      </tr>
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

export default PharmacistBilling;
