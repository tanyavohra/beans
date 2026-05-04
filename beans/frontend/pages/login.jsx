import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiJson, setToken } from "../api.js";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      const data = await apiJson("/auth/login", { method: "POST", body: { email, password } });
      setToken(data.token);
      nav("/dashboard");
    } catch (e2) {
      setErr(e2.message);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <p className="eyebrow">Image intelligence</p>
        <h1>Welcome back</h1>
        <p className="muted">Sign in to upload pictures and summarize them with Gemini.</p>
      </section>
      <form className="form-card" onSubmit={onSubmit}>
        <h2>Login</h2>
        <label>
          Email
          <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input placeholder="Your password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button type="submit">Login</button>
        {err ? <div className="error">{err}</div> : null}
        <p className="muted">
          No account? <Link to="/register">Register</Link>
        </p>
      </form>
    </main>
  );
}
