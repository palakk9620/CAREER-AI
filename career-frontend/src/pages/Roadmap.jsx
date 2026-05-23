import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Map, Lock, UserPlus, LogIn, Calendar, Loader2, BrainCircuit, Download, ArrowRight, Settings } from "lucide-react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function Roadmap({ isDarkMode }) {
    const navigate = useNavigate();
    const location = useLocation();

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [targetRole, setTargetRole] = useState(location.state?.targetRole || sessionStorage.getItem("jr_role") || "");
    const [duration, setDuration] = useState("4 Weeks");

    const [loading, setLoading] = useState(false);
    const [roadmapData, setRoadmapData] = useState(null);

    useEffect(() => {
        const authStatus = localStorage.getItem("isAuthenticated") === "true";
        setIsAuthenticated(authStatus);
    }, []);

    // --- LOGIC: REQUEST GENERATION FROM LIVE PYTHON ENDPOINT ---
    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!targetRole) return alert("Please specify a target role.");

        setLoading(true);
        
        const cachedName = localStorage.getItem("userFullName") || "Candidate";
        const cleanUserId = cachedName.trim().replace(/\s+/g, '_');

        try {
            const response = await axios.post("https://career-ai-8rhm.onrender.com/api/roadmap", {
                user_id: cleanUserId,
                role: targetRole,
                duration: duration
            });

            if (response.data.error) {
                alert(response.data.error);
                setLoading(false);
                return;
            }

            setRoadmapData({
                role: targetRole,
                duration: duration,
                readinessScore: response.data.readiness_score || 75,
                currentSkills: response.data.current_skills || [],
                missingSkills: response.data.missing_skills || [],
                milestones: response.data.roadmap || []
            });

        } catch (err) {
            console.error("Roadmap Extraction Failure:", err);
            alert("Failed to communicate with AI server. Ensure backend container is live.");
        } finally {
            setLoading(false);
        }
    };

    // --- CRUCIAL FIX: HIGH CONTRAST CLIENT SIDE PDF COMPILER ENGINE ---
    const handleDownloadPDF = async () => {
        const targetNode = document.getElementById("roadmap-print-zone");
        if (!targetNode) return alert("Error: PDF visual frame capture context not found.");

        try {
            // Take high-resolution snapshot of DOM elements layout matching background themes
            const canvas = await html2canvas(targetNode, {
                scale: 2, // Enhances text definition and crispness
                useCORS: true,
                backgroundColor: isDarkMode ? "#0e1420" : "#f8fafc"
            });

            const imgData = canvas.toDataURL("image/png");
            
            // Format into an elegant A4 multi-page sequence
            const pdf = new jsPDF("p", "mm", "a4");
            const imgWidth = 190; // Sets comfortable left/right 10mm margins
            const pageHeight = 277; // Sets comfortable top/bottom margins
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 10; // Start printing 10mm down from page top

            pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight + 10;
                pdf.addPage();
                pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`AI_Career_Roadmap_${targetRole.replace(/\s+/g, "_")}.pdf`);
        } catch (err) {
            console.error("Native HTML5 Canvas conversion error stream:", err);
            alert("Failed to compile local PDF document snapshot.");
        }
    };

    const btnPrimary = { padding: "18px 32px", backgroundColor: "var(--primary-accent)", color: "white", borderRadius: "50px", border: "none", fontWeight: "900", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", width: "100%", boxShadow: "0 10px 20px rgba(59, 130, 246, 0.3)" };
    const btnSecondary = { padding: "18px 32px", backgroundColor: "transparent", color: isDarkMode ? "white" : "#0f172a", borderRadius: "50px", border: `2px solid ${isDarkMode ? "rgba(255,255,255,0.2)" : "#cbd5e1"}`, fontWeight: "900", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", width: "100%" };
    const inputStyle = { width: "100%", padding: "15px", borderRadius: "12px", border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.2)" : "#cbd5e1"}`, backgroundColor: isDarkMode ? "rgba(0,0,0,0.3)" : "#ffffff", color: isDarkMode ? "white" : "#0f172a", fontSize: "1rem", outline: "none", marginBottom: "20px" };

    // Breakpoint tracking for layout responsive design flow
    const isMobileView = window.innerWidth < 768;

    return (
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: isMobileView ? "10px" : "20px", minHeight: "70vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>

            <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: isMobileView ? "2.2rem" : "3rem", fontWeight: "900", marginBottom: "30px", color: "var(--body-text)", letterSpacing: "-2px", textAlign: "center" }}>
                AI <span style={{ color: "var(--primary-accent)" }}>ROADMAP</span>
            </motion.h1>

            <AnimatePresence mode="wait">

                {/* STATE 1: LOCKED */}
                {!isAuthenticated && (
                    <motion.div key="locked" initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                        style={{ maxWidth: "600px", margin: "0 auto", padding: isMobileView ? "40px 20px" : "60px 40px", borderRadius: "30px", backgroundColor: "var(--card-bg)", border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "#1c2c45"}`, boxShadow: "0 25px 50px rgba(0,0,0,0.15)", textAlign: "center" }}
                    >
                        <div style={{ position: "relative", display: "inline-block", marginBottom: "30px" }}>
                            <Map size={72} color="var(--primary-accent)" opacity={0.6} />
                            <div style={{ position: "absolute", bottom: -5, right: -10, background: "var(--card-bg)", borderRadius: "50%", padding: "6px" }}><Lock size={28} color="white" /></div>
                        </div>
                        <h2 style={{ fontSize: "2rem", fontWeight: "900", color: isDarkMode ? "white" : "#0f172a", marginBottom: "15px" }}>FEATURE <span style={{ color: "var(--primary-accent)" }}>LOCKED</span></h2>
                        <p style={{ color: isDarkMode ? "rgba(255,255,255,0.7)" : "#475569", lineHeight: "1.8", marginBottom: "40px" }}>Log in to generate a personalized, week-by-week learning path based on your readiness score.</p>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                            <button
                                style={btnPrimary}
                                onClick={() => {
                                    localStorage.setItem("authRedirectTarget", location.pathname);
                                    navigate("/login", { state: { from: location.pathname, targetRole: targetRole, experience: location.state?.experience } });
                                }}
                            >
                                <LogIn size={20} /> Login to Unlock
                            </button>

                            <button
                                style={btnSecondary}
                                onClick={() => {
                                    localStorage.setItem("authRedirectTarget", location.pathname);
                                    navigate("/signup", { state: { from: location.pathname, targetRole: targetRole, experience: location.state?.experience } });
                                }}
                            >
                                <UserPlus size={20} /> Create an Account
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* STATE 2: SETUP CONFIGURATION */}
                {isAuthenticated && !roadmapData && (
                    <motion.form key="setup" initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} onSubmit={handleGenerate}
                        style={{ maxWidth: "800px", margin: "0 auto", padding: isMobileView ? "30px 20px" : "50px", borderRadius: "30px", backgroundColor: "var(--card-bg)", border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "#1c2c45"}`, boxShadow: "0 25px 50px rgba(0,0,0,0.15)" }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "30px", borderBottom: `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "#cbd5e1"}`, paddingBottom: "20px" }}>
                            <Settings size={32} color="var(--primary-accent)" />
                            <h2 style={{ color: isDarkMode ? "white" : "#0f172a", fontSize: "1.8rem", fontWeight: "900", margin: 0 }}>Configure Your Path</h2>
                        </div>

                        <label style={{ display: "block", color: isDarkMode ? "white" : "#475569", fontWeight: "800", marginBottom: "10px", textTransform: "uppercase", fontSize: "0.9rem", textAlign: "left" }}>Target Role</label>
                        <input type="text" placeholder="e.g., Software Engineer" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} required style={inputStyle} />

                        <label style={{ display: "block", color: isDarkMode ? "white" : "#475569", fontWeight: "800", marginBottom: "10px", textTransform: "uppercase", fontSize: "0.9rem", textAlign: "left" }}>Time Duration</label>
                        <div style={{ position: "relative", marginBottom: "30px" }}>
                            <Calendar size={20} color="rgba(255,255,255,0.5)" style={{ position: "absolute", left: "15px", top: "15px", zIndex: 10 }} />
                            <select value={duration} onChange={(e) => setDuration(e.target.value)} style={{ ...inputStyle, paddingLeft: "45px", position: "relative" }}>
                                <option value="2 Weeks" style={{ color: "black" }}>Crash Course (2 Weeks)</option>
                                <option value="4 Weeks" style={{ color: "black" }}>Standard Prep (4 Weeks)</option>
                                <option value="8 Weeks" style={{ color: "black" }}>Deep Dive (8 Weeks)</option>
                                <option value="12 Weeks" style={{ color: "black" }}>Mastery (12 Weeks)</option>
                            </select>
                        </div>

                        <button type="submit" disabled={loading} style={{ ...btnPrimary, padding: "20px" }}>
                            {loading ? <><Loader2 className="animate-spin" /> ARCHITECTING ROADMAP...</> : "GENERATE AI ROADMAP"}
                        </button>
                    </motion.form>
                )}

                {/* STATE 3: GENERATED REPORT */}
                {isAuthenticated && roadmapData && (
                    <motion.div key="report" initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}>
                        
                        {/* THE CAPTURE TARGET LAYER FOR THE EXPORTER ENGINE */}
                        <div id="roadmap-print-zone" style={{ padding: isMobileView ? "10px" : "25px", borderRadius: "20px" }}>
                            
                            <div style={{ textAlign: "center", marginBottom: "30px" }}>
                                <h2 style={{ fontSize: isMobileView ? "1.6rem" : "2rem", color: "var(--body-text)", fontWeight: "900" }}>{roadmapData.duration} Plan for <span style={{ color: "var(--primary-accent)" }}>{roadmapData.role}</span></h2>
                                <h4 style={{ color: "#22c55e", marginTop: "10px", fontWeight: "bold" }}>Job Readiness Score: {roadmapData.readinessScore}/100</h4>
                            </div>

                            {/* SKILLS CHIPS MATRIX (Responsive Column Toggle) */}
                            <div style={{ display: "grid", gridTemplateColumns: isMobileView ? "1fr" : "1fr 1fr", gap: "20px", marginBottom: "30px", textAlign: "left" }}>
                                <div style={{ padding: "25px", borderRadius: "20px", backgroundColor: "var(--card-bg)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                    <h4 style={{ color: "#22c55e", marginBottom: "10px", fontWeight: "bold" }}>Current Strengths</h4>
                                    <p style={{ fontSize: "0.95rem", color: "#cbd5e1", opacity: 0.9 }}>{roadmapData.currentSkills.join(", ") || "Analyzed from resume."}</p>
                                </div>
                                <div style={{ padding: "25px", borderRadius: "20px", backgroundColor: "var(--card-bg)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                    <h4 style={{ color: "var(--primary-accent)", marginBottom: "10px", fontWeight: "bold" }}>Target Gaps to Bridge</h4>
                                    <p style={{ fontSize: "0.95rem", color: "#cbd5e1", opacity: 0.9 }}>{roadmapData.missingSkills.join(", ") || "Mapped by Gemini."}</p>
                                </div>
                            </div>

                            {/* PATHWAY CONTAINER */}
                            <div style={{ padding: isMobileView ? "25px 15px" : "40px", borderRadius: "30px", backgroundColor: "var(--card-bg)", border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "#1c2c45"}`, marginBottom: "40px", color: "#ffffff", textAlign: "left" }}>
                                {roadmapData.milestones.map((node, index) => (
                                    <div key={index} style={{ marginBottom: index === roadmapData.milestones.length - 1 ? 0 : "40px", borderLeft: "3px solid var(--primary-accent)", paddingLeft: "20px" }}>
                                        <h2 style={{ marginBottom: "8px", color: "var(--primary-accent)", fontSize: "1.4rem", fontWeight: "bold" }}>{node.period}: {node.focus}</h2>
                                        <p style={{ color: "#cbd5e1", opacity: 0.9, lineHeight: "1.6", fontSize: "1.05rem" }}><strong>Core Focus:</strong> {node.know_how}</p>
                                        <p style={{ color: "#cbd5e1", opacity: 0.8, marginTop: "6px", fontSize: "0.95rem" }}><strong>Hands-on Build:</strong> {node.project}</p>
                                        <p style={{ color: "#60a5fa", marginTop: "4px", fontSize: "0.9rem", fontStyle: "italic" }}><strong>Resources:</strong> {node.resources}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* LOWER DASHBOARD ACTION TRACERS (Responsive Row/Col Wrap) */}
                        <div style={{ display: "grid", gridTemplateColumns: isMobileView ? "1fr" : "1fr 1fr", gap: "20px", marginTop: "10px" }}>
                            <motion.div whileHover={{ y: -5 }} whileTap={{ scale: 0.98 }} onClick={() => navigate("/interview-prep", { state: { targetRole: targetRole } })} style={{ padding: "30px", borderRadius: "20px", cursor: "pointer", backgroundColor: "var(--primary-accent)", color: "white", display: "flex", alignItems: "center", gap: "20px", textAlign: "left" }}>
                                <BrainCircuit size={40} />
                                <div><h3 style={{ fontSize: "1.2rem", fontWeight: "900" }}>Start Interview Prep</h3><p style={{ fontSize: "0.9rem", opacity: 0.8 }}>Practice specific questions.</p></div>
                                <ArrowRight style={{ marginLeft: "auto" }} />
                            </motion.div>

                            <motion.div whileHover={{ y: -5, backgroundColor: isDarkMode ? "rgba(255,255,255,0.08)" : "#f1f5f9" }} whileTap={{ scale: 0.98 }} onClick={handleDownloadPDF} style={{ padding: "30px", borderRadius: "20px", cursor: "pointer", backgroundColor: "var(--card-bg)", border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "#1c2c45"}`, color: isDarkMode ? "white" : "#0f172a", display: "flex", alignItems: "center", gap: "20px", textAlign: "left" }}>
                                <Download size={40} color="var(--primary-accent)" />
                                <div><h3 style={{ fontSize: "1.2rem", fontWeight: "900", color: isDarkMode ? "white" : "#0f172a" }}>Download PDF</h3><p style={{ fontSize: "0.9rem", opacity: 0.8, color: isDarkMode ? "#cbd5e1" : "#64748b" }}>Save roadmap offline.</p></div>
                            </motion.div>
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}