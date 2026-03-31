import React, { useEffect, useState } from "react";
import Sidebar from "../../components/common/Sidebar";
import "../admin/Dashboard.css";
import { medicinesAPI, categoriesAPI } from "../../services/api";
import toast from "react-hot-toast";
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";

const emptyForm = {
  name: "",
  genericName: "",
  category: "",
  manufacturer: "",
  price: 0,
  costPrice: 0,
  stock: 0,
  minStockLevel: 10,
  unit: "tablet",
  dosageForm: "tablet",
  strength: "",
  expiryDate: "",
  prescription_required: false,
  description: "",
};

const PharmacistInventory = () => {
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockChange, setStockChange] = useState({
    quantity: 0,
    action: "add",
    medicineId: null,
  });

  useEffect(() => {
    fetchCategories();
    fetchMedicines();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await categoriesAPI.getAll();
      setCategories(res.data.data || []);
    } catch (e) {
      console.error("Failed to load categories", e);
    }
  };

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const res = await medicinesAPI.getAll({
        page: 1,
        limit: 200,
        search: query,
        category: categoryFilter,
      });
      const list = res.data.data.medicines || res.data.data || [];
      setMedicines(list);
    } catch (error) {
      console.error("Failed to load medicines", error);
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setQuery(e.target.value);
  };

  const openAdd = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const openEdit = (med) => {
    setEditingId(med._id);
    setFormData({
      name: med.name || "",
      genericName: med.genericName || "",
      category: med.category?._id || med.category || "",
      manufacturer: med.manufacturer || "",
      price: med.price || 0,
      costPrice: med.costPrice || 0,
      stock: med.stock || 0,
      minStockLevel: med.minStockLevel || 10,
      unit: med.unit || "tablet",
      dosageForm: med.dosageForm || "tablet",
      strength: med.strength || "",
      expiryDate: med.expiryDate
        ? new Date(med.expiryDate).toISOString().slice(0, 10)
        : "",
      prescription_required: med.prescription_required || false,
      description: med.description || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await medicinesAPI.update(editingId, formData);
        toast.success("Medicine updated");
      } else {
        await medicinesAPI.create(formData);
        toast.success("Medicine added");
      }
      setShowForm(false);
      fetchMedicines();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save medicine");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this medicine? This will soft-delete it."))
      return;
    try {
      await medicinesAPI.delete(id);
      toast.success("Medicine deleted");
      fetchMedicines();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  const openStockModal = (med) => {
    setStockChange({ quantity: 0, action: "add", medicineId: med._id });
    setShowStockModal(true);
  };

  const submitStock = async () => {
    try {
      const { medicineId, quantity, action } = stockChange;
      await medicinesAPI.updateStock(medicineId, {
        quantity: Number(quantity),
        action,
      });
      toast.success("Stock updated");
      setShowStockModal(false);
      fetchMedicines();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update stock");
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>Inventory</h1>
            <p>Manage medicines and stock</p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <div className="input-group">
              <input
                value={query}
                onChange={handleSearch}
                placeholder="Search medicines"
              />
              <button className="btn" onClick={fetchMedicines}>
                <FiSearch />
              </button>
            </div>
            <button className="btn btn-primary" onClick={openAdd}>
              <FiPlus /> Add Medicine
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">All Medicines</h3>
            <div className="filters">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button className="btn btn-outline" onClick={fetchMedicines}>
                Refresh
              </button>
            </div>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Min Level</th>
                  <th>Price (₹)</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center">
                      Loading...
                    </td>
                  </tr>
                ) : medicines.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No medicines found
                    </td>
                  </tr>
                ) : (
                  medicines.map((med) => (
                    <tr key={med._id}>
                      <td>{med.name}</td>
                      <td>{med.category?.name || "-"}</td>
                      <td>{med.stock}</td>
                      <td>{med.minStockLevel}</td>
                      <td>₹{med.price?.toFixed(2) || "0.00"}</td>
                      <td>
                        {med.expiryDate
                          ? new Date(med.expiryDate).toLocaleDateString()
                          : "—"}
                      </td>
                      <td>
                        {med.stock === 0 ? (
                          <span className="badge badge-danger">Out</span>
                        ) : med.stock <= med.minStockLevel ? (
                          <span className="badge badge-warning">Low</span>
                        ) : (
                          <span className="badge badge-success">In Stock</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            className="btn-icon"
                            onClick={() => openStockModal(med)}
                          >
                            Stock
                          </button>
                          <button
                            className="btn-icon"
                            onClick={() => openEdit(med)}
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            className="btn-icon"
                            onClick={() => handleDelete(med._id)}
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingId ? "Edit Medicine" : "Add Medicine"}</h2>
                <button
                  className="modal-close"
                  onClick={() => setShowForm(false)}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit} className="grid-form">
                  <label>
                    Name
                    <input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </label>
                  <label>
                    Generic Name
                    <input
                      value={formData.genericName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          genericName: e.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    Category
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Manufacturer
                    <input
                      value={formData.manufacturer}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          manufacturer: e.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    Price (₹)
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: Number(e.target.value),
                        })
                      }
                      required
                    />
                  </label>
                  <label>
                    Cost Price (₹)
                    <input
                      type="number"
                      step="0.01"
                      value={formData.costPrice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          costPrice: Number(e.target.value),
                        })
                      }
                    />
                  </label>
                  <label>
                    Stock
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stock: Number(e.target.value),
                        })
                      }
                      required
                    />
                  </label>
                  <label>
                    Min Stock Level
                    <input
                      type="number"
                      value={formData.minStockLevel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minStockLevel: Number(e.target.value),
                        })
                      }
                    />
                  </label>
                  <label>
                    Unit
                    <input
                      value={formData.unit}
                      onChange={(e) =>
                        setFormData({ ...formData, unit: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Dosage Form
                    <input
                      value={formData.dosageForm}
                      onChange={(e) =>
                        setFormData({ ...formData, dosageForm: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Strength
                    <input
                      value={formData.strength}
                      onChange={(e) =>
                        setFormData({ ...formData, strength: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Expiry Date
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) =>
                        setFormData({ ...formData, expiryDate: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Prescription Required
                    <input
                      type="checkbox"
                      checked={formData.prescription_required}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          prescription_required: e.target.checked,
                        })
                      }
                    />
                  </label>
                  <label>
                    Description
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </label>

                  <div
                    style={{
                      gridColumn: "1 / -1",
                      display: "flex",
                      gap: 8,
                      justifyContent: "flex-end",
                    }}
                  >
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowForm(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {showStockModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowStockModal(false)}
          >
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Update Stock</h2>
                <button
                  className="modal-close"
                  onClick={() => setShowStockModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <label>
                  Quantity
                  <input
                    type="number"
                    value={stockChange.quantity}
                    onChange={(e) =>
                      setStockChange((prev) => ({
                        ...prev,
                        quantity: Number(e.target.value),
                      }))
                    }
                  />
                </label>
                <label>
                  Action
                  <select
                    value={stockChange.action}
                    onChange={(e) =>
                      setStockChange((prev) => ({
                        ...prev,
                        action: e.target.value,
                      }))
                    }
                  >
                    <option value="add">Add</option>
                    <option value="subtract">Subtract</option>
                  </select>
                </label>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowStockModal(false)}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={submitStock}>
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PharmacistInventory;
