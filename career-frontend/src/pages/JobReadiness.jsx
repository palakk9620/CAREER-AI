import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, BrainCircuit, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import axios from "axios";

export default function JobReadiness({ isDarkMode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [fullName, setFullName] = useState(() => location.state?.fullName || sessionStorage.getItem("jr_fullName") || "");
  const [targetRole, setTargetRole] = useState(() => location.state?.targetRole || sessionStorage.getItem("jr_role") || "");
  const [experience, setExperience] = useState(() => location.state?.experience || sessionStorage.getItem("jr_exp") || "Fresher");
  const [jobDescription, setJobDescription] = useState(() => sessionStorage.getItem("jr_jd") || "");
  const [file, setFile] = useState(location.state?.file || null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    sessionStorage.setItem("jr_fullName", fullName);
    sessionStorage.setItem("jr_role", targetRole);
    sessionStorage.setItem("jr_exp", experience);
    sessionStorage.setItem("jr_jd", jobDescription);
  }, [fullName, targetRole, experience, jobDescription]);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError("");

    if (!file || !fullName || !targetRole || !jobDescription) {
      return alert("All fields are mandatory!");
    }

    setLoading(true);

    const dataPayload = new FormData();
    const cleanUserId = fullName.trim().replace(/\s+/g, '_');
    dataPayload.append("user_id", cleanUserId);
    dataPayload.append("file", file);
    dataPayload.append("target_role", targetRole);

    try {
      // 1. Sync file context directly onto our centralized MongoDB server instance
      await axios.post("http://localhost:8000/upload-resume", dataPayload, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // 2. Dispatch cross-examination verification matching trigger natively via JSON
      const matchResponse = await axios.post("http://localhost:8000/match-jd", {
        user_id: cleanUserId,
        job_description: jobDescription
      });

      if (matchResponse.data.error) {
        setError(matchResponse.data.error);
        setLoading(false);
        return;
      }

      // 3. Destructure and render the live Gemini data values natively
      setResult({
        match_score: matchResponse.data.match_score ?? 60,
        target_role: targetRole,
        matched_skills: matchResponse.data.tips || ["Resume parsed correctly."], 
        missing_skills: matchResponse.data.missing_keywords || ["No major keyword discrepancies found."]
      });

    } catch (err) {
      console.error("Connection Interface Failure:", err);
      setError("Failed to communicate with your AI server wrapper. Verify that your backend container is running live.");
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = { display: "block", textAlign: "left", marginBottom: "8px", fontWeight: "800", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "1px", color: isDarkMode ? "white" : "#1e293b" };
  const inputStyle = { width: "100%", padding: "15px", borderRadius: "12px", border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.2)" : "#cbd5e1"}`, backgroundColor: isDarkMode ? "rgba(0, 0, 0, 0.3)" : "#ffffff", color: isDarkMode ? "white" : "#0f172a", fontSize: "1rem", marginBottom: "10px", outline: "none", transition: "border-color 0.3s ease" };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>

      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: "3rem", fontWeight: "900", marginBottom: "30px", color: "var(--body-text)", letterSpacing: "-2px", textAlign: "center", wordSpacing: "0.8rem" }}>
        JOB <span style={{ color: "var(--primary-accent)" }}>READINESS</span>
      </motion.h1>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.form key="form" initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} onSubmit={handleAnalyze} style={{ maxWidth: "1000px", margin: "0 auto", padding: "50px", borderRadius: "30px", backgroundColor: "var(--card-bg)", border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "#1c2c45"}`, boxShadow: "0 25px 50px rgba(0,0,0,0.15)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>

            {error && <div style={{ gridColumn: "span 2", backgroundColor: "#fee2e2", color: "#b91c1c", padding: "15px", borderRadius: "10px", fontWeight: "600" }}>{error}</div>}

            <div style={{ gridColumn: "span 1" }}><label style={labelStyle}>Full Name *</label><input type="text" placeholder="e.g., John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required style={inputStyle} /></div>
            <div style={{ gridColumn: "span 1" }}><label style={labelStyle}>Targeted Role *</label><input type="text" placeholder="e.g., Software Engineer" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} required style={inputStyle} /></div>

            <div style={{ gridColumn: "span 2" }}>
              <label style={labelStyle}>Experience Level *</label>
              <select style={inputStyle} value={experience} onChange={e => setExperience(e.target.value)}>
                <option value="Internship" style={{ color: "black" }}>Internship</option>
                <option value="Fresher" style={{ color: "black" }}>Fresher</option>
                <option value="1-3 Years" style={{ color: "black" }}>1 - 3 Years</option>
                <option value="3+ Years" style={{ color: "black" }}>3+ Years</option>
              </select>
            </div>

            <div style={{ gridColumn: "span 2" }}><label style={labelStyle}>Job Description *</label><textarea placeholder="Paste requirements..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} required style={{ ...inputStyle, minHeight: "150px" }} /></div>

            <div style={{ gridColumn: "span 2" }}>
              <label style={labelStyle}>Resume / CV (PDF) *</label>
              {file ? (
                <div style={{ ...inputStyle, display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #22c55e", backgroundColor: "rgba(34, 197, 94, 0.1)" }}>
                  <span style={{ color: "#22c55e", fontWeight: "bold" }}>✅ {file.name || "Resume Attached from ATS"}</span>
                  <button type="button" onClick={() => setFile(null)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontWeight: "bold", textTransform: "uppercase", fontSize: "0.8rem" }}>Replace</button>
                </div>
              ) : (
                <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} required style={{ ...inputStyle, border: "none", padding: "10px 0" }} />
              )}
            </div>

            <motion.button 
              type="submit" 
              disabled={loading} 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              style={{ gridColumn: "span 2", padding: "18px", backgroundColor: loading ? "#475569" : "var(--primary-accent)", color: "white", borderRadius: "50px", border: "none", fontWeight: "900", fontSize: "1.1rem", cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 10px 20px rgba(59, 130, 246, 0.3)", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}
            >
              {loading ? <><Loader2 className="animate-spin" /> ANALYZING...</> : "GENERATE READINESS REPORT"}
            </motion.button>
          </motion.form>
        ) : (
          <motion.div key="result" initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: "1000px", margin: "0 auto" }}>

            {/* MATCH SCORE */}
            <div style={{ padding: "40px", borderRadius: "30px", marginBottom: "30px", textAlign: "center", backgroundColor: "var(--card-bg)", border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "#1c2c45"}`, boxShadow: "0 25px 50px rgba(0,0,0,0.15)" }}>
              <h2 style={{ fontSize: "1.2rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "2px", fontWeight: "700" }}>JD Match: {result.target_role}</h2>
              <h1 style={{ fontSize: "7rem", fontWeight: "900", color: "var(--primary-accent)", margin: "10px 0", lineHeight: "1", letterSpacing: "-5px" }}>{result.match_score}<span style={{ fontSize: "3rem" }}>%</span></h1>
            </div>

            {/* SKILLS BREAKDOWN */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", marginBottom: "40px" }}>
              <div style={{ padding: "30px", borderRadius: "20px", backgroundColor: "var(--card-bg)", border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "#1c2c45"}` }}>
                <h3 style={{ color: isDarkMode ? "white" : "#0f172a", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}><CheckCircle2 color="#22c55e" /> Actionable Advice</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", textAlign: "left", color: isDarkMode ? "rgba(255,255,255,0.8)" : "#334155" }}>
                  {result.matched_skills.map((skill, i) => (
                    <span key={i} style={{ lineHeight: "1.6" }}>• {skill}</span>
                  ))}
                </div>
              </div>

              <div style={{ padding: "30px", borderRadius: "20px", backgroundColor: "var(--card-bg)", border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "#1c2c45"}` }}>
                <h3 style={{ color: isDarkMode ? "white" : "#0f172a", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}><AlertTriangle color="#ef4444" /> Missing Keywords</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {result.missing_skills.map((skill, i) => (
                    <span key={i} style={{ padding: "8px 16px", backgroundColor: "rgba(239, 68, 68, 0.15)", color: "#ef4444", borderRadius: "8px", fontWeight: "bold", fontSize: "0.9rem" }}>{skill}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* NAVIGATION ACTIONS */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
              <motion.div whileHover={{ y: -5 }} onClick={() => navigate("/interview-prep", { state: { userId: fullName.replace(/\s+/g, '_'), jd: jobDescription, experience: experience } })} style={{ padding: "40px", borderRadius: "30px", cursor: "pointer", backgroundColor: "var(--card-bg)", border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "#1c2c45"}`, color: "white", textAlign: "left" }}>
                <BrainCircuit size={48} color="var(--primary-accent)" style={{ marginBottom: "20px" }} />
                <h3 style={{ fontSize: "1.5rem", fontWeight: "800" }}>Practice Arena</h3>
                <p style={{ opacity: 0.7, marginTop: "10px" }}>Get JD-specific technical & behavioral questions based on your missing skills.</p>
              </motion.div>

              <motion.div whileHover={{ y: -5 }} onClick={() => navigate("/roadmap", { state: { targetRole: targetRole, experience: experience, userId: fullName.replace(/\s+/g, '_') } })} style={{ padding: "40px", borderRadius: "30px", cursor: "pointer", backgroundColor: "var(--card-bg)", border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "#1c2c45"}`, color: "white", textAlign: "left" }}>
                <ArrowRight size={48} color="var(--primary-accent)" style={{ marginBottom: "20px" }} />
                <h3 style={{ fontSize: "1.5rem", fontWeight: "800" }}>Mastery Roadmap</h3>
                <p style={{ opacity: 0.7, marginTop: "10px" }}>Bridge your skill gaps with an AI learning path.</p>
              </motion.div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}