import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ApiError } from "../api/client";

type Mode = "login" | "register";

export function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login, register } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (mode === "login") {
        await login({ email, password });
        notify("Welcome back!", "success");
        navigate("/", { replace: true });
      } else {
        await register({
          first_name: firstName,
          last_name: lastName,
          email,
          password,
        });
        notify("Account created! You can now sign in.", "success");
        setMode("login");
        setPassword("");
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong";
      notify(message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-backdrop" aria-hidden="true" />

      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-logo">🛰️</span>
          <h1>Tech Scout</h1>
          <p>Earn badges. Track your growth. Get mentored.</p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
          >
            Sign in
          </button>
          <button
            type="button"
            className={mode === "register" ? "active" : ""}
            onClick={() => setMode("register")}
          >
            Create account
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <div className="field-row">
              <div className="field">
                <label className="field-label" htmlFor="first-name">
                  First name
                </label>
                <input
                  id="first-name"
                  className="field-input"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label className="field-label" htmlFor="last-name">
                  Last name
                </label>
                <input
                  id="last-name"
                  className="field-input"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="field">
            <label className="field-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="field-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@techscout.com"
              required
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="field-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting
              ? "Please wait..."
              : mode === "login"
              ? "Sign in"
              : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
