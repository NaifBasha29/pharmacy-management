import React, { useState } from "react";
import Sidebar from "../../components/common/Sidebar";
import "../admin/Dashboard.css";
import { medicinesAPI, aiAPI } from "../../services/api";
import toast from "react-hot-toast";
import { FiSearch, FiTrash2, FiPlay } from "react-icons/fi";

const PharmacistAIDrugCheck = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);

  const searchMedicines = async () => {
    try {
      const res = await medicinesAPI.getAll({ search: query, limit: 10 });
      const list = res.data.data.medicines || res.data.data || [];
      setResults(list);
    } catch (err) {
      toast.error("Search failed");
    }
  };

  const addMedicine = (med) => {
    if (selected.find((s) => s._id === med._id)) return;
    setSelected((prev) => [...prev, med]);
  };

  const removeSelected = (id) =>
    setSelected((prev) => prev.filter((p) => p._id !== id));

  const analyze = async () => {
    if (selected.length < 2) {
      toast.error("Select at least two medicines to analyze");
      return;
    }
    setLoading(true);
    try {
      const names = selected.map((s) => s.name).join(", ");
      const prompt = `Check drug interactions for these medicines: [${names}]. List any dangerous interactions, incompatibilities, and suggest safer alternatives where possible. Return a short safety summary and pairwise compatibility.`;
      const res = await aiAPI.chat(prompt);
      setAnalysis(
        res.data.data ||
          res.data || { message: res.data.message || "No response" },
      );
      setHistory((prev) =>
        [
          {
            medicines: selected.map((s) => s.name),
            result: res.data.data || res.data,
          },
          ...prev,
        ].slice(0, 5),
      );
    } catch (err) {
      console.error(err);
      toast.error("AI analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setSelected([]);
    setAnalysis(null);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>AI Drug Check</h1>
            <p>Analyze interactions between selected medicines</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Search Medicines</h3>
          </div>
          <div
            className="card-body"
            style={{ display: "flex", gap: 8, alignItems: "center" }}
          >
            <input
              placeholder="Search medicine by name"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="btn" onClick={searchMedicines}>
              <FiSearch />
            </button>
          </div>
          <div className="card-body">
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {results.map((r) => (
                <div
                  key={r._id}
                  style={{
                    border: "1px solid var(--border-light)",
                    padding: 8,
                    borderRadius: 8,
                    minWidth: 200,
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{r.name}</div>
                  <div className="text-secondary">{r.category?.name}</div>
                  <div style={{ marginTop: 8 }}>
                    <button
                      className="btn btn-outline"
                      onClick={() => addMedicine(r)}
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: 12 }}>
          <div className="card-header">
            <h3 className="card-title">Selected Medicines</h3>
          </div>
          <div className="card-body">
            {selected.length === 0 ? (
              <p className="text-secondary">No medicines selected</p>
            ) : (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {selected.map((s) => (
                  <div
                    key={s._id}
                    style={{
                      padding: 8,
                      border: "1px solid var(--border-light)",
                      borderRadius: 8,
                      minWidth: 160,
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{s.name}</div>
                    <div className="text-secondary">{s.strength}</div>
                    <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
                      <button
                        className="btn btn-outline"
                        onClick={() => removeSelected(s._id)}
                      >
                        <FiTrash2 /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <button
                className="btn btn-primary"
                onClick={analyze}
                disabled={loading}
              >
                <FiPlay /> Analyze
              </button>
              <button className="btn btn-secondary" onClick={clearAll}>
                Clear
              </button>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: 12 }}>
          <div className="card-header">
            <h3 className="card-title">Analysis Result</h3>
          </div>
          <div className="card-body">
            {loading ? (
              <p>Analyzing...</p>
            ) : analysis ? (
              <pre style={{ whiteSpace: "pre-wrap" }}>
                {JSON.stringify(analysis, null, 2)}
              </pre>
            ) : (
              <p className="text-secondary">No analysis yet</p>
            )}
          </div>
        </div>

        <div className="card" style={{ marginTop: 12 }}>
          <div className="card-header">
            <h3 className="card-title">History (this session)</h3>
          </div>
          <div className="card-body">
            {history.length === 0 ? (
              <p className="text-secondary">No history</p>
            ) : (
              <ul>
                {history.map((h, idx) => (
                  <li key={idx}>
                    <strong>{h.medicines.join(", ")}</strong>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PharmacistAIDrugCheck;
