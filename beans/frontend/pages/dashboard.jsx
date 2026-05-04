import { useEffect, useMemo, useState } from "react";
import { apiForm, apiJson, setToken } from "../api.js";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const nav = useNavigate();
  const [file, setFile] = useState(null);
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

  useEffect(() => {
    apiJson("/auth/me").then((data) => setUser(data.user)).catch(() => {});
  }, []);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function logout() {
    setToken("");
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
      setSummary(res.summary || "No summary returned.");
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="dashboard">
      <header className="topbar">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Picture summaries</h1>
          <p className="muted">{user?.email ? `Signed in as ${user.email}` : "Upload a PNG, JPG, or WebP image."}</p>
        </div>
        <button className="ghost-button" onClick={logout}>Logout</button>
      </header>

      <section className="workspace">
        <form className="upload-panel" onSubmit={onSubmit}>
          <label className="drop-zone">
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <span>{file ? file.name : "Choose an image"}</span>
            <small>PNG, JPG, or WebP up to 5 MB</small>
          </label>

          {preview ? <img className="preview" src={preview} alt="Selected upload preview" /> : <div className="preview placeholder">No image selected</div>}

          <button disabled={busy} type="submit">{busy ? "Summarizing..." : "Summarize image"}</button>
          {err ? <div className="error">{err}</div> : null}
        </form>

        <article className="summary-panel">
          <p className="eyebrow">Gemini output</p>
          <h2>Summary</h2>
          {summary ? <pre>{summary}</pre> : <p className="muted">Your summary will appear here after upload.</p>}
        </article>
      </section>
    </main>
  );
}
