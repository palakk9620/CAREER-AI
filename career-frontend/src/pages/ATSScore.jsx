import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileSearch, CheckCircle2, AlertTriangle, Loader2, ArrowRight, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function ATSScore({ isDarkMode }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(() => {
        const saved = sessionStorage.getItem("ats_formData");
        return saved ? JSON.parse(saved) : { fullName: "", targetRole: "", experience: "Internship" };
    });
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        sessionStorage.setItem("ats_formData", JSON.stringify(formData));
    }, [formData]);

    const handleAnalyze = async (e) => {
        e.preventDefault();
        if (!file) return alert("Please upload your resume.");

        setLoading(true);

        // 1. DEFINE VARIABLES FIRST SO THEY ARE IN SCOPE FOR EVERYTHING BELOW
        const cleanUserId = (formData.fullName || "AnonymousUser").trim().replace(/\s+/g, '_');
        const formattedJd = `Targeting a ${formData.experience} role as a ${formData.targetRole}.`;

        // Prepare Multipart form data for the raw PDF transmission layer
        const dataPayload = new FormData();
        dataPayload.append("user_id", cleanUserId);
        dataPayload.append("file", file);
        dataPayload.append("target_role", formData.targetRole);

        try {
            // 2. Fire off file binary to storage route location
            await axios.post("https://career-ai-8rhm.onrender.com/upload-resume", dataPayload, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            // 3. Execute cross-matching logic over native JSON layout schemas
            const matchResponse = await axios.post("https://career-ai-8rhm.onrender.com/match-jd", {
                user_id: cleanUserId,
                job_description: formattedJd
            });

            // Trace error catches gracefully
            if (matchResponse.data && matchResponse.data.error) {
                alert(matchResponse.data.error);
                setLoading(false);
                return;
            }

            // 4. Map values into local view variables perfectly matching rendering keys
            setResult({
                score: matchResponse.data.match_score ?? 70,
                strengths: matchResponse.data.tips || ["Resume parsed correctly."],
                improvements: matchResponse.data.missing_keywords || ["No major discrepancies found!"]
            });

        } catch (err) {
            console.error("API Communication Failure:", err);
            if (err.response && err.response.data) {
                alert(`Server Error: ${JSON.stringify(err.response.data.detail || err.response.data.error)}`);
            } else {
                alert("Failed to reach Python AI matching server. Check terminal console logs.");
            }
        } finally {
            setLoading(false);
        }
    };

    const labelStyle = { display: "block", textAlign: "left", marginBottom: "8px", fontWeight: "800", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "1px", color: isDarkMode ? "white" : "#1e293b" };
    const inputStyle = { width: "100%", padding: "15px", borderRadius: "12px", border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.2)" : "#cbd5e1"}`, backgroundColor: isDarkMode ? "rgba(0,0,0,0.3)" : "#ffffff", color: isDarkMode ? "white" : "#0f172a", fontSize: "1rem", marginBottom: "20px", outline: "none" };

    return (
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
            <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: "3rem", fontWeight: "900", marginBottom: "30px", color: "var(--body-text)", letterSpacing: "-2px", textAlign: "center", wordSpacing: "0.8rem" }}>
                ATS <span style={{ color: "var(--primary-accent)" }}>ANALYZER</span>
            </motion.h1>

            <AnimatePresence mode="wait">
                {!result ? (
                    <motion.form key="form" initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} onSubmit={handleAnalyze} style={{ padding: "50px", borderRadius: "30px", backgroundColor: "var(--card-bg)", border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "#1c2c45"}`, boxShadow: "0 25px 50px rgba(0,0,0,0.15)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <div style={{ gridColumn: "span 1" }}><label style={labelStyle}>Full Name</label><input type="text" value={formData.fullName} placeholder="e.g., John Doe" required style={inputStyle} onChange={e => setFormData({ ...formData, fullName: e.target.value })} /></div>
                        <div style={{ gridColumn: "span 1" }}><label style={labelStyle}>Target Role</label><input type="text" value={formData.targetRole} placeholder="e.g., Frontend Developer" required style={inputStyle} onChange={e => setFormData({ ...formData, targetRole: e.target.value })} /></div>
                        <div style={{ gridColumn: "span 1" }}>
                            <label style={labelStyle}>Experience Level</label>
                            <select value={formData.experience} style={inputStyle} onChange={e => setFormData({ ...formData, experience: e.target.value })}>
                                <option value="Internship" style={{ color: "black" }}>Internship</option>
                                <option value="Fresher" style={{ color: "black" }}>Fresher</option>
                                <option value="1-3 Years" style={{ color: "black" }}>1 - 3 Years</option>
                                <option value="3+ Years" style={{ color: "black" }}>3+ Years</option>
                            </select>
                        </div>
                        <div style={{ gridColumn: "span 1" }}><label style={labelStyle}>Resume Upload (PDF)</label><input type="file" accept=".pdf" required style={{ ...inputStyle, padding: "12px" }} onChange={e => setFile(e.target.files[0])} /></div>

                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{ gridColumn: "span 2", padding: "18px", backgroundColor: "var(--primary-accent)", color: "white", borderRadius: "50px", border: "none", fontWeight: "900", cursor: loading ? "not-allowed" : "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", marginTop: "10px" }}
                        >
                            {loading ? <><Loader2 className="animate-spin" /> SCANNING RESUME...</> : <><FileSearch size={20} /> RUN ATS SCAN</>}
                        </motion.button>
                    </motion.form>
                ) : (
                    <motion.div key="result" initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}>
                        <div style={{ padding: "40px", borderRadius: "30px", marginBottom: "30px", textAlign: "center", backgroundColor: "var(--card-bg)", border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "#1c2c45"}` }}>
                            <h2 style={{ color: "#94a3b8", textTransform: "uppercase", letterSpacing: "2px", fontWeight: "800" }}>Overall ATS Score</h2>
                            <h1 style={{ fontSize: "6rem", fontWeight: "900", color: result.score > 75 ? "#22c55e" : "var(--primary-accent)", margin: "0", lineHeight: "1" }}>{result.score}<span style={{ fontSize: "2rem" }}>/100</span></h1>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
                            <div style={{ padding: "30px", borderRadius: "30px", backgroundColor: "var(--card-bg)", border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "#1c2c45"}` }}><h3 style={{ color: isDarkMode ? "white" : "#0f172a", display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}><CheckCircle2 color="#22c55e" /> Actionable Tips</h3><ul style={{ color: isDarkMode ? "rgba(255,255,255,0.8)" : "#334155", paddingLeft: "20px", lineHeight: "2" }}>{result.strengths.map((item, i) => <li key={i}>{item}</li>)}</ul></div>
                            <div style={{ padding: "30px", borderRadius: "30px", backgroundColor: "var(--card-bg)", border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "#1c2c45"}` }}><h3 style={{ color: isDarkMode ? "white" : "#0f172a", display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}><AlertTriangle color="#eab308" /> Missing Keywords</h3><ul style={{ color: isDarkMode ? "rgba(255,255,255,0.8)" : "#334155", paddingLeft: "20px", lineHeight: "2" }}>{result.improvements.map((item, i) => <li key={i}>{item}</li>)}</ul></div>
                        </div>

                        <motion.div
                            whileHover={{ y: -5, scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => navigate("/readiness", { state: { fullName: formData.fullName, targetRole: formData.targetRole, experience: formData.experience, file: file } })}
                            style={{ marginTop: "30px", padding: "40px", borderRadius: "30px", backgroundColor: "var(--primary-accent)", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 15px 30px rgba(59, 130, 246, 0.3)" }}
                        >
                            <div>
                                <h2 style={{ fontSize: "1.8rem", fontWeight: "900", display: "flex", alignItems: "center", gap: "15px", margin: 0 }}><Target size={32} /> CHECK JOB READINESS</h2>
                                <p style={{ opacity: 0.8, marginTop: "10px", fontSize: "1.1rem", margin: 0 }}>See how your resume stacks up against a specific job description.</p>
                            </div>
                            <ArrowRight size={40} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}