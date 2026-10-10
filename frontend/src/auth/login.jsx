import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Ripple } from "primereact/ripple";
import { Toast } from "primereact/toast";
import { Oval } from "react-loader-spinner";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { authAPI } from "../services/api";
import loginImage from "../data/login.jpg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();
  const toast = useRef(null);

  // Future phase flag: Set to true when GOOGLE_CLIENT_ID is provided in .env
  const SHOW_GOOGLE_AUTH = false;

  const handleGoogleLogin = async (googlePayload) => {
    setIsLoading(true);
    try {
      const data = await authAPI.googleLogin(googlePayload);
      sessionStorage.setItem("name", data.name);
      sessionStorage.setItem("email", data.email);
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("userId", data._id || data.id);
      sessionStorage.setItem("role", data.role || "user");
      localStorage.setItem("token", data.token);
      localStorage.setItem("name", data.name);
      localStorage.setItem("email", data.email);
      localStorage.setItem("role", data.role || "user");

      setIsLoading(false);
      navigate(data.role === "admin" ? "/admin" : "/home");
    } catch (err) {
      setIsLoading(false);
      setError(err.message || "Google Sign-In failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const data = await authAPI.login(email, password);

      // Save session info
      sessionStorage.setItem("name", data.name);
      sessionStorage.setItem("email", data.email);
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("userId", data._id || data.id);
      sessionStorage.setItem("role", data.role || "user");
      localStorage.setItem("token", data.token);
      localStorage.setItem("name", data.name);
      localStorage.setItem("email", data.email);
      localStorage.setItem("role", data.role || "user");

      setIsLoading(false);
      if (data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/home");
      }
    } catch (err) {
      setIsLoading(false);
      const msg = err.message || "Invalid email or password.";
      setError(msg);
      if (toast.current) {
        toast.current.show({
          severity: "error",
          summary: "Login Failed",
          detail: msg,
          life: 3000,
        });
      }
    }
  };

  return (
    <div className="auth-page-wrapper">
      <Toast ref={toast} className="custom-toast-warning" />

      <div className="auth-split-card">
        {/* Visual Side (Desktop) */}
        <div className="auth-visual-col">
          <img src={loginImage} alt="StyleLease Fashion" className="auth-visual-img" />
          <div className="auth-visual-overlay">
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#fbbf24", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
              <Sparkles size={16} />
              <span>Premium Fashion Rental</span>
            </div>
            <h2 style={{ fontSize: "28px", fontWeight: 800, lineHeight: "1.2", marginBottom: "8px" }}>
              Dress to Impress without the Price Tag.
            </h2>
            <p style={{ fontSize: "14px", color: "#cbd5e1" }}>
              Rent designer footwear and statement styles for your college events, presentations, and celebrations.
            </p>
          </div>
        </div>

        {/* Form Side (Mobile & Desktop) */}
        <div className="auth-form-col">
          <div className="auth-form-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <img src="images/StyleLease.png" alt="StyleLease" style={{ height: "30px" }} />
            </div>
            <h2>Welcome Back</h2>
            <p>Sign in to manage your bookings and rental bag</p>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: "#fef2f2",
                border: "1px solid #fee2e2",
                color: "#b91c1c",
                padding: "10px 14px",
                borderRadius: "var(--radius-sm)",
                fontSize: "13px",
                marginBottom: "16px",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="auth-input-group">
              <label htmlFor="email">Email Address</label>
              <div className="auth-input-with-icon">
                <Mail size={18} className="auth-icon-left" />
                <input
                  id="email"
                  type="email"
                  className="auth-field"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="auth-input-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label htmlFor="password" style={{ margin: 0 }}>Password</label>
              </div>
              <div className="auth-input-with-icon">
                <Lock size={18} className="auth-icon-left" />
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  className="auth-field"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div
                  className="auth-password-toggle"
                  onClick={() => setShowPass(!showPass)}
                  title={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <Eye size={18} /> : <EyeOff size={18} />}
                </div>
              </div>
            </div>

            {/* Remember Me */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px", fontSize: "13px", color: "var(--text-muted)" }}>
              <input type="checkbox" id="rememberMe" defaultChecked style={{ cursor: "pointer" }} />
              <label htmlFor="rememberMe" style={{ cursor: "pointer" }}>
                Remember my login on this device
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="auth-submit-btn p-ripple"
            >
              {isLoading ? (
                <Oval visible={true} height="20" width="20" color="#fff" secondaryColor="#fff" />
              ) : (
                <>
                  <span>Sign In to Account</span>
                  <ArrowRight size={18} />
                </>
              )}
              <Ripple />
            </button>

            {/* Google OAuth 2.0 Single Sign-On Hook (Hidden until client id is provided) */}
            {SHOW_GOOGLE_AUTH && (
              <div style={{ marginTop: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "16px 0", color: "#94a3b8", fontSize: "12px" }}>
                  <div style={{ flex: 1, height: "1px", backgroundColor: "#e2e8f0" }}></div>
                  <span>OR CONTINUE WITH</span>
                  <div style={{ flex: 1, height: "1px", backgroundColor: "#e2e8f0" }}></div>
                </div>
                <button
                  type="button"
                  onClick={() => handleGoogleLogin({ email: "google.user@example.com", name: "Google User" })}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    padding: "10px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "#fff",
                    color: "#334155",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              </div>
            )}

            {/* Switch to Signup */}
            <div style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "var(--text-muted)" }}>
              Don't have an account yet?{" "}
              <Link to="/signup" style={{ color: "var(--primary)", fontWeight: 600 }}>
                Create Account &rarr;
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
