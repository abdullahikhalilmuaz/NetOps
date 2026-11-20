import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { Mail, LockKeyhole, Eye, EyeOff, LoaderCircle, ArrowUpRight, Wifi, UserRound, Phone, Building } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirm: "", phone: "", department: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  function set(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  async function submit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error("Name, email and password are required."); return; }
    if (form.password.length < 8) { toast.error("Password must contain at least 8 characters."); return; }
    if (form.password !== form.confirm) { toast.error("Passwords do not match."); return; }
    setLoading(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
        department: form.department.trim()
      });
      toast.success("Account created. Welcome!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed.");
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
          <span className="eyebrow">CREATE ACCOUNT</span>
          <h1>Join your workspace</h1>
          <p>New accounts are created as Staff. An administrator can upgrade your role later.</p>
        </div>

        <form onSubmit={submit}>
          <label>Full name</label>
          <div className="auth-input">
            <UserRound size={18} />
            <input placeholder="Jane Doe" value={form.name} onChange={(e) => set("name", e.target.value)} required />
          </div>

          <label>Email address</label>
          <div className="auth-input">
            <Mail size={18} />
            <input type="email" placeholder="you@company.com" value={form.email} onChange={(e) => set("email", e.target.value)} required />
          </div>

          <label>Phone number</label>
          <div className="auth-input">
            <Phone size={18} />
            <input placeholder="+234..." value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </div>

          <label>Department</label>
          <div className="auth-input">
            <Building size={18} />
            <input placeholder="IT Department" value={form.department} onChange={(e) => set("department", e.target.value)} />
          </div>

          <label>Password</label>
          <div className="auth-input">
            <LockKeyhole size={18} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              required
            />
            <button type="button" className="password-toggle" onClick={() => setShowPassword((v) => !v)}>
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>

          <label>Confirm password</label>
          <div className="auth-input">
            <LockKeyhole size={18} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Repeat your password"
              value={form.confirm}
              onChange={(e) => set("confirm", e.target.value)}
              required
            />
          </div>

          <button className="btn btn-primary auth-submit" disabled={loading} type="submit">
            {loading ? <LoaderCircle className="spin" size={18} /> : "Create account"}
            {!loading && <ArrowUpRight size={18} />}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login" style={{ color: "var(--primary)", fontWeight: 700 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
