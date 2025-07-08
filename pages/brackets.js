import { useEffect, useState } from "react";

export default function BracketViewer() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/brackets")
      .then(res => res.json())
      .then(setData)
      .catch(() => setData({}));
  }, []);

  const downloadJson = () => {
    if (!data) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "brackets.json";
    link.click();
  };

  if (!data) return <p style={{ color: "white", textAlign: "center" }}>Loading...</p>;

  return (
    <div style={{
      backgroundColor: "#1e1e2f",
      color: "#fff",
      padding: "20px",
      fontFamily: "Arial, sans-serif",
      minHeight: "100vh",
      maxWidth: "700px",
      margin: "0 auto"
    }}>
      <h1 style={{ textAlign: "center", color: "#ffce3d" }}>🏆 Current Brackets</h1>

      <button
        onClick={downloadJson}
        style={{
          backgroundColor: "#ffce3d",
          border: "none",
          borderRadius: "6px",
          padding: "10px 20px",
          marginBottom: "20px",
          cursor: "pointer",
          fontWeight: "bold",
          color: "#000",
          display: "block",
          marginLeft: "auto",
          marginRight: "auto"
        }}
      >
        📥 Download as .json
      </button>

      {Object.keys(data).length === 0 ? (
        <p style={{ textAlign: "center" }}>No teams have signed up yet.</p>
      ) : (
        Object.entries(data).map(([id, entry]) => (
          <div key={id} style={{
            border: "1px solid #555",
            borderRadius: "10px",
            padding: "15px",
            marginBottom: "15px",
            backgroundColor: "#2a2a3c"
          }}>
            <h3>🆔 Bracket ID: {id} — 🏷 Rank: {entry.rank}</h3>
            <p>
              👤 <strong>{entry.player1.roblox}</strong> ({entry.player1.discord})<br />
              👥 <strong>{entry.player2.roblox}</strong> ({entry.player2.discord})<br />
              🕒 {new Date(entry.timestamp).toLocaleString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
