import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, ArrowRight, LayoutDashboard, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Auth({ isDarkMode }) {
  const navigate = useNavigate();
  const location = useLocation(); 
  
  const [authMethod, setAuthMethod] = useState("email"); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Centralized adaptive redirection engine
  const navigateToDestination = () => {
    const targetDestination = localStorage.getItem("authRedirectTarget") || location.state?.from || "/";
    localStorage.removeItem("authRedirectTarget"); // Clean up session memory instantly
    navigate(targetDestination);
  };

  useEffect(() => {
      if (window.google && authMethod === "email") {
          window.google.accounts.id.initialize({
              client_id: "619019951845-osf8jdlenfhib79akb5hp4mahiuue3uk.apps.googleusercontent.com",
              ux_mode: "popup",
              callback: (response) => {
                  localStorage.setItem("isAuthenticated", "true");
                  localStorage.setItem("userFullName", "Palak Rohra");
                  
                  // Execute adaptive redirect check for Google Auth
                  navigateToDestination();
              }
          });

          window.google.accounts.id.renderButton(
              document.getElementById("google-login-target"),
              { theme: isDarkMode ? "filled_black" : "outline", size: "large", width: "240", shape: "pill" }
          );
      }
  }, [authMethod, isDarkMode]);

  const handleLogin = (e) => {
    e?.preventDefault(); 
    setError("");

    if (authMethod === "email") {
      if (!email.endsWith("@gmail.com") && !email.endsWith("@oriental.ac.in")) {
        return setError("Registration requires a valid @gmail.com or @oriental.ac.in address.");
      }
      if (password.length < 8 || !/\d/.test(password) || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return setError("Invalid Credentials. Password requires 8+ chars, 1 number, and 1 special character.");
      }
    } else if (authMethod === "phone") {
      if (!/^\d{10}$/.test(phone)) {
        return setError("Security Policy: Phone number must be exactly 10 digits.");
      }
    }

    executeLoginSequence();
  };

  const executeLoginSequence = () => {
    localStorage.setItem("isAuthenticated", "true"); 
    const existingName = localStorage.getItem("userFullName");
    
    if (!existingName || existingName.includes("@") || /^\d+$/.test(existingName)) {
      if (authMethod === "email") {
        const handle = email.split("@")[0];
        const resolvedName = /^\d+/.test(handle) ? "Palak Rohra" : handle;
        localStorage.setItem("userFullName", resolvedName);
      } else {
        localStorage.setItem("userFullName", "Candidate");
      }
    }

    // Execute adaptive redirect check for standard Form layouts
    navigateToDestination();
  };

  const inputStyle = { width: "100%", padding: "16px", borderRadius: "12px", border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "#cbd5e1"}`, marginBottom: "20px", backgroundColor: isDarkMode ? "rgba(0, 0, 0, 0.2)" : "#ffffff", color: isDarkMode ? "white" : "#0f172a", outline: "none", fontSize: "1rem" };
  const labelStyle = { display: "block", fontSize: "12px", fontWeight: "800", color: isDarkMode ? "#94a3b8" : "#64748b", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" };
  const btnStyle = { width: "100%", padding: "18px", backgroundColor: "#3b82f6", color: "white", borderRadius: "50px", border: "none", fontWeight: "900", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", boxShadow: "0 10px 20px rgba(59, 130, 246, 0.2)" };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", paddingTop: "20px" }}>
      <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", maxWidth: "1000px", width: "100%", borderRadius: "30px", overflow: "hidden", boxShadow: "0 25px 50px rgba(0,0,0,0.15)", border: isDarkMode ? "1px solid hsla(0, 0%, 100%, 0.10)" : "2px solid #1c2c45" }}>
        
        <div style={{ flex: 1, padding: "50px", background: "linear-gradient(135deg, #1e293b 0%, #0b0f1a 100%)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ color: "var(--primary-accent)", marginBottom: "20px" }}><LayoutDashboard size={40} /></div>
          <h2 style={{ fontSize: "2.2rem", fontWeight: "900", color: "white", wordSpacing: "0.6rem", lineHeight: "1.2" }}>AI CAREER <span style={{color: "var(--primary-accent)"}}>NAVIGATION</span></h2>
          <p style={{ color: "rgba(255,255,255,0.6)", marginTop: "20px", lineHeight: "1.7" }}>Login to get exclusive access to industry-level interview questions and roadmaps tailored for you.</p>
        </div>

        <div style={{ flex: 1.2, padding: "60px", backgroundColor: isDarkMode ? "#0e1420" : "#f8fafc", transition: "all 0.4s ease" }}>
          <h2 style={{ fontSize: "1.8rem", fontWeight: "800", color: isDarkMode ? "white" : "#0f172a", marginBottom: "10px", wordSpacing: "0.5rem" }}>Welcome Back</h2>
          <p style={{ color: "#64748b", marginBottom: "30px" }}>Please enter your details to continue.</p>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "15px", borderRadius: "10px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px", fontWeight: "bold", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
                <AlertCircle size={20} /> <span style={{ fontSize: "0.9rem" }}>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {authMethod === "email" ? (
              <motion.form key="email" onSubmit={handleLogin} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <label style={labelStyle}>Email</label>
                <input type="email" placeholder="e.g., your@gmail.com" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
                
                <div style={{ position: "relative" }}>
                  <label style={labelStyle}>Password</label>
                  <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required style={{...inputStyle, paddingRight: "45px"}} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "15px", top: "38px", background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <motion.button 
                  type="submit" 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  style={{...btnStyle, marginBottom: "20px"}}
                >
                  LOGIN <ArrowRight size={18} style={{marginLeft: "10px"}} />
                </motion.button>

                <p style={{ fontSize: "14px", color: "#64748b", textAlign: "center", marginBottom: "30px" }}>
                  Not already a user? <span onClick={() => navigate("/signup")} style={{ color: "#3b82f6", cursor: "pointer", fontWeight: "bold" }}>Sign up</span>
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "20px" }}>
                  <div style={{ flex: 1, height: "1px", backgroundColor: isDarkMode ? "rgba(255,255,255,0.1)" : "#e2e8f0" }}></div>
                  <span style={{ fontSize: "12px", fontWeight: "bold", color: "#94a3b8" }}>OR SECURE IDENTITY</span>
                  <div style={{ flex: 1, height: "1px", backgroundColor: isDarkMode ? "rgba(255,255,255,0.1)" : "#e2e8f0" }}></div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "15px", alignItems: "center" }}>
                    <div id="google-login-target" style={{ minHeight: "45px" }}></div>
                    <span onClick={() => { setAuthMethod("phone"); setError(""); }} style={{ fontSize: "13px", fontWeight: "bold", color: "#3b82f6", cursor: "pointer" }}>
                        → Use Phone Login Instead
                    </span>
                </div>
              </motion.form>
            ) : (
              <motion.form key="phone" onSubmit={handleLogin} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <label style={labelStyle}>Phone Number (10 Digits)</label>
                <input type="tel" placeholder="e.g., 9876543210" value={phone} onChange={e => setPhone(e.target.value)} required style={inputStyle} />
                
                <motion.button 
                  type="submit" 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  style={btnStyle}
                >
                  GET SECURE OTP <ArrowRight size={18} style={{marginLeft: "10px"}} />
                </motion.button>

                <p onClick={() => {setAuthMethod("email"); setError("");}} style={{ fontSize: "14px", color: "#3b82f6", textAlign: "center", cursor: "pointer", fontWeight: "bold", marginTop: "30px" }}>
                  ← Back to Email Login
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}