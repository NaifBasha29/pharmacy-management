import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { usersAPI, authAPI, patientsAPI } from "../../services/api";
import Sidebar from "../../components/common/Sidebar";
import {
  FiUser,
  FiActivity,
  FiShield,
  FiLock,
  FiLogOut,
  FiX,
  FiHeart,
} from "react-icons/fi";
import toast from "react-hot-toast";

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  const [personalData, setPersonalData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: {
      street: user?.address?.street || "",
      city: user?.address?.city || "",
      state: user?.address?.state || "",
      zipCode: user?.address?.zipCode || "",
    },
  });
  const [medicalData, setMedicalData] = useState({
    allergies: [],
    chronicConditions: [],
    bloodGroup: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await authAPI.getMe();
        const profile = res.data?.data?.user || {};
        setPersonalData({
          name: profile.name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          address: {
            street: profile.address?.street || "",
            city: profile.address?.city || "",
            state: profile.address?.state || "",
            zipCode: profile.address?.zipCode || "",
          },
        });
        setMedicalData({
          allergies: Array.isArray(profile.allergies) ? profile.allergies : [],
          chronicConditions: Array.isArray(profile.chronicConditions)
            ? profile.chronicConditions
            : [],
          bloodGroup: profile.bloodGroup || "",
        });
      } catch (error) {
        console.error("Failed to load profile", error);
      }
    };

    loadProfile();
  }, []);

  const handlePersonalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // If logged-in entity is a patient, update the Patient record instead
      if (user?.type === "patient" || user?.role === "patient") {
        const res = await patientsAPI.updateProfile({
          name: personalData.name,
          phone: personalData.phone,
          address: personalData.address,
          email: personalData.email,
        });
        const updatedPatient = res.data?.data?.patient;
        // Refresh authenticated user from server to include health fields
        try {
          const meRes = await authAPI.getMe();
          const fresh = meRes.data?.data?.user;
          if (fresh) updateUser(fresh);
        } catch (e) {
          // fallback to updatedPatient minimal update
          if (updatedPatient) {
            const normalized = {
              id: updatedPatient._id || updatedPatient.id,
              name: updatedPatient.name,
              email: updatedPatient.email,
              phone: updatedPatient.phone,
              role: "patient",
              type: "patient",
              patientId: updatedPatient.patientId,
            };
            updateUser(normalized);
          }
        }
        toast.success("Profile updated!");
      } else {
        const res = await usersAPI.updateProfile({
          name: personalData.name,
          phone: personalData.phone,
          address: personalData.address,
        });
        const updated = res.data?.data?.user;
        if (updated) {
          const normalized = {
            id: updated.id || updated._id,
            name: updated.name,
            email: updated.email,
            phone: updated.phone,
            address: updated.address,
            role: updated.role || user?.role,
            type: user?.type || 'user',
          };
          updateUser(normalized);
        }
        toast.success("Profile updated!");
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Update failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success("Password changed!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error("Change failed");
    } finally {
      setLoading(false);
    }
  };

  const handleArrayInput = (e, field) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = e.target.value.trim();
      if (value) {
        setMedicalData((prev) => ({
          ...prev,
          [field]: [...prev[field], value],
        }));
        e.target.value = "";
      }
    }
  };

  // Add current input value on blur (helps users who don't press Enter)
  const handleArrayInputOnBlur = (e, field) => {
    try {
      const value = e.target.value?.trim();
      if (value) {
        setMedicalData((prev) => ({
          ...prev,
          [field]: [...prev[field], value],
        }));
        e.target.value = "";
      }
    } catch (err) {
      // ignore
    }
  };

  const removeArrayItem = (field, index) =>
    setMedicalData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));

  const handleMedicalSave = async () => {
    setLoading(true);
    try {
      const res = await patientsAPI.updateProfile({
        bloodGroup: medicalData.bloodGroup,
        allergies: medicalData.allergies,
        chronicConditions: medicalData.chronicConditions,
      });
      const updatedPatient = res.data?.data?.patient;
      if (updatedPatient) {
        setMedicalData({
          bloodGroup: updatedPatient.bloodGroup || "",
          allergies: Array.isArray(updatedPatient.allergies)
            ? updatedPatient.allergies
            : [],
          chronicConditions: Array.isArray(updatedPatient.chronicConditions)
            ? updatedPatient.chronicConditions
            : [],
        });
        // refresh authenticated user so dashboard can pick up new health info
        try {
          const meRes = await authAPI.getMe();
          const fresh = meRes.data?.data?.user;
          if (fresh) updateUser(fresh);
        } catch (e) {
          // ignore
        }
      }
      toast.success("Health profile updated");
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to save health profile";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const page = {
    background: "var(--bg-primary)",
    minHeight: "100vh",
    padding: "2rem",
    color: "var(--text-primary)",
  };
  const card = {
    background: "var(--bg-secondary)",
    borderRadius: "1rem",
    boxShadow: "0 2px 8px var(--border-light)",
    overflow: "hidden",
  };
  const input = {
    width: "100%",
    padding: "0.75rem 1rem",
    border: "1px solid var(--border-light)",
    borderRadius: "0.75rem",
    background: "var(--bg-tertiary)",
    color: "var(--text-primary)",
    outline: "none",
  };
  const label = {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "var(--text-primary)",
    marginBottom: "0.5rem",
  };
  const btn = {
    padding: "0.75rem 1.5rem",
    fontWeight: 600,
    color: "white",
    background: "linear-gradient(135deg, #f97316, #ea580c)",
    border: "none",
    borderRadius: "0.75rem",
    cursor: "pointer",
  };
  const logoutBtn = {
    width: "100%",
    marginTop: "1rem",
    padding: "0.625rem 0.875rem",
    borderRadius: "0.75rem",
    border: "1px solid var(--status-error)",
    background: "var(--status-error-bg)",
    color: "var(--status-error)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    fontWeight: 600,
    cursor: "pointer",
  };

  const tabs = [
    {
      id: "personal",
      label: "Personal Details",
      icon: <FiUser />,
      color: "#f97316",
    },
    {
      id: "medical",
      label: "Health Profile",
      icon: <FiActivity />,
      color: "#ef4444",
    },
    { id: "security", label: "Security", icon: <FiShield />, color: "#f97316" },
  ];

  return (
    <div className="dashboard-layout no-top-nav">
      <Sidebar />
      <main className="dashboard-main" style={page}>
        <div style={{ marginBottom: "2rem" }}>
          <h1
            style={{
              fontSize: "1.875rem",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            My{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #f97316, #ea580c)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Profile
            </span>
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Manage your account and health information
          </p>
        </div>

        <div style={{ display: "flex", gap: "2rem" }}>
          {/* Sidebar */}
          <div style={{ width: 280, flexShrink: 0 }}>
            <div style={card}>
              <div style={{ padding: "1rem" }}>
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "1rem",
                      marginBottom: "0.5rem",
                      border: "none",
                      borderRadius: "0.75rem",
                      cursor: "pointer",
                      background:
                        activeTab === tab.id
                          ? "linear-gradient(135deg, #f97316, #ea580c)"
                          : "transparent",
                      color:
                        activeTab === tab.id
                          ? "white"
                          : "var(--text-secondary)",
                      fontWeight: 600,
                      transition: "all 0.2s",
                    }}
                  >
                    <span style={{ fontSize: "1.25rem" }}>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            <div
              style={{
                ...card,
                marginTop: "1rem",
                padding: "1.5rem",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  background: "linear-gradient(135deg, #f97316, #ea580c)",
                  borderRadius: "1rem",
                  margin: "0 auto 1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                }}
              >
                {user?.name?.charAt(0)}
              </div>
              <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                {user?.name}
              </div>
              <div
                style={{
                  fontSize: "0.875rem",
                  color: "var(--text-secondary)",
                  marginBottom: "0.75rem",
                }}
              >
                {user?.role}
              </div>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  fontSize: "0.75rem",
                  background: "#dcfce7",
                  color: "#16a34a",
                  padding: "0.25rem 0.625rem",
                  borderRadius: "9999px",
                  fontWeight: 600,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    background: "#16a34a",
                    borderRadius: "50%",
                  }}
                ></span>{" "}
                Active
              </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={logoutBtn}
                >
                  <FiLogOut size={16} /> Logout
                </button>
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1 }}>
            <div style={{ ...card, padding: "2rem" }}>
              {activeTab === "personal" && (
                <form onSubmit={handlePersonalSubmit}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      marginBottom: "1.5rem",
                      paddingBottom: "1rem",
                      borderBottom: "1px solid var(--bg-secondary)",
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        background: "#eff6ff",
                        borderRadius: "0.625rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#f97316",
                      }}
                    >
                      <FiUser />
                    </div>
                    <span style={{ fontSize: "1.125rem", fontWeight: 700 }}>
                      Personal Details
                    </span>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: "1rem",
                    }}
                  >
                    <div>
                      <label style={label}>Full Name</label>
                      <input
                        type="text"
                        value={personalData.name}
                        onChange={(e) =>
                          setPersonalData({
                            ...personalData,
                            name: e.target.value,
                          })
                        }
                        style={input}
                      />
                    </div>
                    <div>
                      <label style={label}>Email</label>
                      <input
                        type="email"
                        value={personalData.email}
                        disabled
                        style={{
                          ...input,
                          background: "var(--border-light)",
                          color: "var(--text-secondary)",
                        }}
                      />
                    </div>
                    <div>
                      <label style={label}>Phone</label>
                      <input
                        type="tel"
                        value={personalData.phone}
                        onChange={(e) =>
                          setPersonalData({
                            ...personalData,
                            phone: e.target.value,
                          })
                        }
                        style={input}
                      />
                    </div>
                    <div>
                      <label style={label}>Street</label>
                      <input
                        type="text"
                        value={personalData.address.street}
                        onChange={(e) =>
                          setPersonalData({
                            ...personalData,
                            address: {
                              ...personalData.address,
                              street: e.target.value,
                            },
                          })
                        }
                        style={input}
                      />
                    </div>
                    <div>
                      <label style={label}>City</label>
                      <input
                        type="text"
                        value={personalData.address.city}
                        onChange={(e) =>
                          setPersonalData({
                            ...personalData,
                            address: {
                              ...personalData.address,
                              city: e.target.value,
                            },
                          })
                        }
                        style={input}
                      />
                    </div>
                    <div>
                      <label style={label}>State</label>
                      <input
                        type="text"
                        value={personalData.address.state}
                        onChange={(e) =>
                          setPersonalData({
                            ...personalData,
                            address: {
                              ...personalData.address,
                              state: e.target.value,
                            },
                          })
                        }
                        style={input}
                      />
                    </div>
                    <div>
                      <label style={label}>ZIP</label>
                      <input
                        type="text"
                        value={personalData.address.zipCode}
                        onChange={(e) =>
                          setPersonalData({
                            ...personalData,
                            address: {
                              ...personalData.address,
                              zipCode: e.target.value,
                            },
                          })
                        }
                        style={input}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      textAlign: "right",
                      marginTop: "1.5rem",
                      paddingTop: "1rem",
                      borderTop: "1px solid var(--bg-secondary)",
                    }}
                  >
                    <button type="submit" disabled={loading} style={btn}>
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === "medical" && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      marginBottom: "1.5rem",
                      paddingBottom: "1rem",
                      borderBottom: "1px solid var(--bg-secondary)",
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        background: "#fef2f2",
                        borderRadius: "0.625rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#ef4444",
                      }}
                    >
                      <FiActivity />
                    </div>
                    <span style={{ fontSize: "1.125rem", fontWeight: 700 }}>
                      Health Profile
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      padding: "1rem",
                      background: "#fef2f2",
                      borderRadius: "0.75rem",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        background: "#fee2e2",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#ef4444",
                        fontSize: "1.25rem",
                      }}
                    >
                      <FiHeart />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ ...label, marginBottom: "0.25rem" }}>
                        Blood Group
                      </label>
                      <select
                        value={medicalData.bloodGroup}
                        onChange={(e) =>
                          setMedicalData({
                            ...medicalData,
                            bloodGroup: e.target.value,
                          })
                        }
                        style={{
                          ...input,
                          width: 120,
                          padding: "0.5rem",
                          fontWeight: 600,
                          color: "#ef4444",
                        }}
                      >
                        <option value="">Select</option>
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                          (g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ),
                        )}
                      </select>
                    </div>
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={label}>Allergies (Press Enter)</label>
                    <input
                      type="text"
                      onKeyDown={(e) => handleArrayInput(e, "allergies")}
                      onBlur={(e) => handleArrayInputOnBlur(e, "allergies")}
                      style={input}
                      placeholder="e.g. Penicillin"
                    />
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.5rem",
                        marginTop: "0.5rem",
                      }}
                    >
                      {medicalData.allergies.map((item, i) => (
                        <span
                          key={i}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            padding: "0.25rem 0.625rem",
                            background: "#fee2e2",
                            color: "#ef4444",
                            borderRadius: "9999px",
                            fontSize: "0.8rem",
                            fontWeight: 500,
                          }}
                        >
                          {item}{" "}
                          <button
                            type="button"
                            onClick={() => removeArrayItem("allergies", i)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: "#ef4444",
                            }}
                          >
                            <FiX size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={label}>
                      Chronic Conditions (Press Enter)
                    </label>
                    <input
                      type="text"
                      onKeyDown={(e) =>
                        handleArrayInput(e, "chronicConditions")
                      }
                      onBlur={(e) => handleArrayInputOnBlur(e, "chronicConditions")}
                      style={input}
                      placeholder="e.g. Diabetes"
                    />
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.5rem",
                        marginTop: "0.5rem",
                      }}
                    >
                      {medicalData.chronicConditions.map((item, i) => (
                        <span
                          key={i}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            padding: "0.25rem 0.625rem",
                            background: "#fef3c7",
                            color: "#d97706",
                            borderRadius: "9999px",
                            fontSize: "0.8rem",
                            fontWeight: 500,
                          }}
                        >
                          {item}{" "}
                          <button
                            type="button"
                            onClick={() =>
                              removeArrayItem("chronicConditions", i)
                            }
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: "#d97706",
                            }}
                          >
                            <FiX size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div
                    style={{
                      textAlign: "right",
                      marginTop: "1.5rem",
                      paddingTop: "1rem",
                      borderTop: "1px solid var(--bg-secondary)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={handleMedicalSave}
                      disabled={loading}
                      style={btn}
                    >
                      {loading ? "Saving..." : "Save Health Profile"}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <form onSubmit={handlePasswordSubmit}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      marginBottom: "1.5rem",
                      paddingBottom: "1rem",
                      borderBottom: "1px solid var(--bg-secondary)",
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        background: "#fff7ed",
                        borderRadius: "0.625rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#f97316",
                      }}
                    >
                      <FiShield />
                    </div>
                    <span style={{ fontSize: "1.125rem", fontWeight: 700 }}>
                      Change Password
                    </span>
                  </div>
                  <div style={{ maxWidth: 400 }}>
                    <div style={{ marginBottom: "1rem" }}>
                      <label style={label}>Current Password</label>
                      <div style={{ position: "relative" }}>
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              currentPassword: e.target.value,
                            })
                          }
                          style={input}
                          required
                        />
                        <FiLock
                          style={{
                            position: "absolute",
                            right: 12,
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "var(--text-secondary)",
                          }}
                        />
                      </div>
                    </div>
                    <div style={{ marginBottom: "1rem" }}>
                      <label style={label}>New Password</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                        style={input}
                        required
                      />
                    </div>
                    <div style={{ marginBottom: "1rem" }}>
                      <label style={label}>Confirm Password</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                        style={input}
                        required
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      textAlign: "right",
                      marginTop: "1.5rem",
                      paddingTop: "1rem",
                      borderTop: "1px solid var(--bg-secondary)",
                    }}
                  >
                    <button
                      type="submit"
                      disabled={loading}
                      style={{ ...btn, background: "#1e293b" }}
                    >
                      {loading ? "Changing..." : "Update Password"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
