import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { Mail, LockKeyhole, Eye, EyeOff, LoaderCircle, ArrowUpRight, Wifi } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  async function submit(e) {
    e.preventDefault();
    if (!email || !password) { toast.error("Enter your email and password."); return; }
    setLoading(true);
    try {
      await login(email.trim(), password);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed. Check your credentials and server connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-decoration auth-decoration-one" />
      <div className="auth-decoration auth-decoration-two" />

      <div className="auth-card">
        <div className="brand auth-brand">
          <div className="brand-mark"><Wifi size={23} /></div>
          <div>
            <strong>NetOps</strong>
            <span>OPERATIONS MANAGEMENT</span>
          </div>
        </div>

        <div className="auth-heading">
          <span className="eyebrow">WELCOME BACK</span>
          <h1>Sign in to your account</h1>
          <p>Manage your organization's IT operations in one place.</p>
        </div>

        <form onSubmit={submit}>
          <label>Email address</label>
          <div className="auth-input">
            <Mail size={18} />
            <input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <label>Password</label>
          <div className="auth-input">
            <LockKeyhole size={18} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="button" className="password-toggle" onClick={() => setShowPassword((v) => !v)}>
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>

          <button className="btn btn-primary auth-submit" disabled={loading} type="submit">
            {loading ? <LoaderCircle className="spin" size={18} /> : "Sign in"}
            {!loading && <ArrowUpRight size={18} />}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register" style={{ color: "var(--primary)", fontWeight: 700 }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}
