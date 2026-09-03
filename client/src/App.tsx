import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [backendStatus, setBackendStatus] = useState("Checking...");

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/health");

        if (!response.ok) {
          throw new Error("Backend request failed");
        }

        const data = await response.json();

        if (data.status === "ok") {
          setBackendStatus("Connected");
        } else {
          setBackendStatus("Unexpected response");
        }
      } catch (error) {
        console.error("Failed to connect to backend:", error);
        setBackendStatus("Disconnected");
      }
    };

    checkBackend();
  }, []);

  return (
    <main className="app">
      <section className="hero">
        <p className="eyebrow">CLOUD FILE STORAGE</p>

        <h1>CloudVault</h1>

        <p className="description">
          A secure full-stack cloud file management application.
        </p>

        <div className="status-card">
          <span>Backend Status</span>
          <strong>{backendStatus}</strong>
        </div>
      </section>
    </main>
  );
}

export default App;