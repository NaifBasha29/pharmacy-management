import React from "react";
import Sidebar from "../../components/common/Sidebar";
import "./ClinicDashboard.css";

const ClinicSettings = () => {
  return (
    <div className="clinic-dashboard">
      <aside className="clinic-sidebar">
        <Sidebar />
      </aside>
      <main className="clinic-main">
        <header className="clinic-header">
          <h1>Settings</h1>
          <p>Clinic configuration and preferences</p>
        </header>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Clinic Settings</h3>
          </div>
          <div className="card-body">
            <p>
              Settings UI coming soon. You can configure clinic information,
              working hours, and notifications here.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClinicSettings;
