import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiJson, setToken } from "../api.js";

export default function Register() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      const data = await apiJson("/auth/register", { method: "POST", body: { email, password } });
      setToken(data.token);
      nav("/dashboard");
    } catch (e2) {
      setErr(e2.message);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <p className="eyebrow">Gemini summaries</p>
        <h1>Create your account</h1>
        <p className="muted">Register once, then keep a private dashboard for image summaries.</p>
      </section>
      <form className="form-card" onSubmit={onSubmit}>
        <h2>Register</h2>
        <label>
          Email
          <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input placeholder="8+ characters" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
        </label>
        <button type="submit">Create account</button>
        {err ? <div className="error">{err}</div> : null}
        <p className="muted">
          Have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </main>
  );
}
