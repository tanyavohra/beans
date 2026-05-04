import React, { useState } from "react";
import { apiForm, apiJson } from "../api.js";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const nav = useNavigate();
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function logout() {
    await apiJson("/auth/logout", { method: "POST" });
    nav("/login");
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setSummary("");
    if (!file) return setErr("Pick an image first");

    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await apiForm("/image/summarize", fd);
      setSummary(res.summary || "");
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 700, margin: "40px auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Dashboard</h2>
        <button onClick={logout}>Logout</button>
      </div>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button disabled={busy} type="submit">{busy ? "Summarizing..." : "Summarize image"}</button>
      </form>

      {err ? <div style={{ color: "crimson", marginTop: 12 }}>{err}</div> : null}
      {summary ? (
        <pre style={{ whiteSpace: "pre-wrap", marginTop: 12, padding: 12, background: "#111", color: "#eee", borderRadius: 8 }}>
          {summary}
        </pre>
      ) : null}
    </div>
  );
}
