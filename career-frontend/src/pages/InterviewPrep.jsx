import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  BrainCircuit, Users, User, Briefcase, Lock, LogIn, UserPlus, 
  ArrowLeft, ChevronDown, ChevronUp, CheckCircle2, XCircle, Loader2, Download
} from "lucide-react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function InterviewPrep({ isDarkMode }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Context layers parsed gracefully from navigation state stack frames
  const role = location.state?.targetRole || sessionStorage.getItem("jr_role") || "Software Engineer";
  const experience = location.state?.experience || sessionStorage.getItem("jr_exp") || "Fresher";

  // State Management
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeSection, setActiveSection] = useState(null); // 'GD', 'Technical', 'HR', 'Managerial'
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(null);
  const [activeFlashcard, setActiveFlashcard] = useState(null);

  useEffect(() => {
    setIsAuthenticated(localStorage.getItem("isAuthenticated") === "true");
  }, []);

  // --- LOGIC: FETCH LIVE QUESTIONS FROM PYTHON GEMINI ENDPOINT ---
  const handleSectionClick = async (section) => {
    setActiveSection(section);
    setLoading(true);
    setContent(null);

    const cachedName = localStorage.getItem("userFullName") || "Candidate";
    const cleanUserId = cachedName.trim().replace(/\s+/g, '_');

    try {
      const response = await axios.post("https://career-ai-8rhm.onrender.com/api/interview", {
        user_id: cleanUserId,
        role: role,
        experience: experience,
        section: section
      });

      if (response.data.error) {
        alert(response.data.error);
        setActiveSection(null);
        return;
      }

      setContent(response.data);
    } catch (err) {
      console.error("AI Interview Generation Failure:", err);
      alert("Failed to communicate with interview runtime instance. Check server logs.");
      setActiveSection(null);
    } finally {
      setLoading(false);
    }
  };

  // --- CRUCIAL FIX: CLIENT-SIDE HTML5 CANVAS SNAPSHOT COMPILER ENGINE ---
  const handleDownloadPDF = async () => {
    if (!activeSection) return;
    
    // Explicitly toggle all flashcard accordions open so their text contents are visible to the canvas capture stream
    const accordions = document.querySelectorAll('[id^="accordion-details-"]');
    accordions.forEach(el => el.style.height = "auto");

    const targetNode = document.getElementById("interview-print-zone");
    if (!targetNode) return alert("Error: Visual capture element layout container context missing.");

    try {
      const canvas = await html2canvas(targetNode, {
        scale: 2, // Doubles pixel definition for crystal clear reading clarity
        useCORS: true,
        backgroundColor: isDarkMode ? "#0e1420" : "#f8fafc"
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 190; // Balanced 10mm margins
      const pageHeight = 277;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${activeSection}_Preparation_Guide.pdf`);
    } catch (err) {
      console.error("PDF Compilation client runtime exception:", err);
      alert("Failed to assemble local document snapshot.");
    }
  };

  const handleBack = () => {
    setActiveSection(null);
    setContent(null);
    setActiveFlashcard(null);
  };

  const btnPrimary = { padding: "18px 32px", backgroundColor: "var(--primary-accent)", color: "white", borderRadius: "50px", border: "none", fontWeight: "900", cursor: "pointer", display: "flex", alignItems: "center", justifyContext: "center", gap: "10px", width: "100%" };
  const btnSecondary = { padding: "18px 32px", backgroundColor: "transparent", color: isDarkMode ? "white" : "#0f172a", borderRadius: "50px", border: `2px solid ${isDarkMode ? "rgba(255,255,255,0.2)" : "#cbd5e1"}`, fontWeight: "900", cursor: "pointer", display: "flex", alignItems: "center", justifyContext: "center", gap: "10px", width: "100%" };

  // Track real-time breakpoint status to enable adaptive rendering
  const isMobileView = window.innerWidth < 768;

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: isMobileView ? "10px" : "20px", minHeight: "70vh" }}>
      
      {/* HEADER SECTION LAYOUT */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{ fontSize: isMobileView ? "2.2rem" : "3rem", fontWeight: "900", color: "var(--body-text)", letterSpacing: "-2px" }}>
          INTERVIEW <span style={{ color: "var(--primary-accent)" }}>PREPARATION</span>
        </h1>
        <p style={{ color: isDarkMode ? "#94a3b8" : "#64748b", fontSize: "1.1rem" }}>
          Tailored AI Training for: <strong style={{ color: "var(--body-text)" }}>{experience} {role}</strong>
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        
        {/* STATE 1: LOCKED GUEST ACCOUNT LIMITS */}
        {!isAuthenticated && (
          <motion.div key="locked" initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            style={{ maxWidth: "600px", margin: "0 auto", padding: isMobileView ? "40px 20px" : "60px 40px", borderRadius: "30px", backgroundColor: "var(--card-bg)", border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "#1c2c45"}`, boxShadow: "0 25px 50px rgba(0,0,0,0.15)", textAlign: "center" }}
          >
            <div style={{ position: "relative", display: "inline-block", marginBottom: "30px" }}>
              <BrainCircuit size={72} color="var(--primary-accent)" opacity={0.6} />
              <div style={{ position: "absolute", bottom: -5, right: -10, background: "var(--card-bg)", borderRadius: "50%", padding: "6px" }}><Lock size={28} color="white" /></div>
            </div>
            <h2 style={{ fontSize: "2rem", fontWeight: "900", color: isDarkMode ? "white" : "#0f172a", marginBottom: "15px" }}>ARENA <span style={{ color: "var(--primary-accent)" }}>LOCKED</span></h2>
            <p style={{ color: isDarkMode ? "rgba(255,255,255,0.7)" : "#475569", lineHeight: "1.8", marginBottom: "40px" }}>Log in to access AI-generated mock questions and Group Discussion topics tailored precisely to your profile.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <button style={btnPrimary} onClick={() => {
                localStorage.setItem("authRedirectTarget", location.pathname);
                navigate("/login", { state: { from: location.pathname, targetRole: role, experience: experience } });
              }}><LogIn size={20} /> Login to Unlock</button>
              
              <button style={btnSecondary} onClick={() => {
                localStorage.setItem("authRedirectTarget", location.pathname);
                navigate("/signup", { state: { from: location.pathname, targetRole: role, experience: experience } });
              }}><UserPlus size={20} /> Create an Account</button>
            </div>
          </motion.div>
        )}

        {/* STATE 2: CORE TRAINING HUB SELECTION DASHBOARD (Responsive Column Adaptive Stack) */}
        {isAuthenticated && !activeSection && (
          <motion.div key="menu" initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            style={{ display: "grid", gridTemplateColumns: isMobileView ? "1fr" : "1fr 1fr", gap: "30px" }}
          >
            {[
              { id: "GD", title: "Group Discussion", icon: <Users size={40} />, desc: "Trending topics with For & Against analysis." },
              { id: "Technical", title: "Technical Interview", icon: <BrainCircuit size={40} />, desc: "Core competency and problem-solving questions." },
              { id: "HR", title: "HR Interview", icon: <User size={40} />, desc: "Behavioral, cultural, and situational questions." },
              { id: "Managerial", title: "Managerial Interview", icon: <Briefcase size={40} />, desc: "Leadership, conflict, and scaling questions." }
            ].map(card => (
              <motion.div 
                key={card.id} whileHover={{ y: -5, scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleSectionClick(card.id)}
                style={{ padding: isMobileView ? "30px 20px" : "40px", borderRadius: "30px", cursor: "pointer", backgroundColor: "var(--card-bg)", border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "#1c2c45"}`, color: "white", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", textAlign: "left" }}
              >
                <div style={{ color: "var(--primary-accent)", marginBottom: "20px" }}>{card.icon}</div>
                <h3 style={{ fontSize: "1.4rem", fontWeight: "900", marginBottom: "10px" }}>{card.title}</h3>
                <p style={{ opacity: 0.7, fontSize: "0.95rem" }}>{card.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* STATE 3: LIVE RE-RENDER ENGINE */}
        {isAuthenticated && activeSection && (
          <motion.div key="content" initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}>
            
            <div style={{ display: "flex", flexDirection: isMobileView ? "column" : "row", justifyContent: "space-between", alignItems: isMobileView ? "flex-start" : "center", gap: "15px", marginBottom: "30px" }}>
              <button onClick={handleBack} style={{ background: "none", border: "none", color: "var(--primary-accent)", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", fontWeight: "bold", fontSize: "1rem" }}>
                <ArrowLeft size={20} /> Back to Modules
              </button>
              
              {!loading && content && (
                <button onClick={handleDownloadPDF} style={{ background: "none", border: "none", color: "#22c55e", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontWeight: "bold", fontSize: "1rem" }}>
                  <Download size={20} /> Download Prep PDF
                </button>
              )}
            </div>

            {loading ? (
              <div style={{ padding: "100px 0", textAlign: "center", color: "var(--body-text)" }}>
                <Loader2 className="animate-spin" size={60} style={{ color: "var(--primary-accent)", margin: "0 auto 20px auto" }} />
                <h3 style={{ fontSize: "1.5rem", fontWeight: "800" }}>AI is preparing your session...</h3>
                <p style={{ opacity: 0.7 }}>Analyzing matching technical patterns for {role} vectors.</p>
              </div>
            ) : (
              content && (
                /* VISUAL TARGET BIND FOR HTML5 PRINT SNAPSHOT GENERATOR */
                <div id="interview-print-zone" style={{ display: "flex", flexDirection: "column", gap: "30px", padding: isMobileView ? "5px" : "15px" }}>
                  
                  {/* --- COMPONENT VIEW A: NATIVE GROUP DISCUSSION LAYOUT --- */}
                  {activeSection === "GD" && content.map(topic => (
                    <div key={topic.id} style={{ backgroundColor: "var(--card-bg)", borderRadius: "20px", padding: isMobileView ? "25px 15px" : "30px", border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "#1c2c45"}`, color: "white" }}>
                      <h3 style={{ fontSize: isMobileView ? "1.25rem" : "1.5rem", fontWeight: "900", color: "var(--primary-accent)", marginBottom: "30px", textAlign: "center", lineHeight: "1.3" }}>Topic: {topic.topic}</h3>
                      
                      {/* Responsive Grid Splitter -> Stacks vertically cleanly on devices */}
                      <div style={{ display: "grid", gridTemplateColumns: isMobileView ? "1fr" : "1fr 1fr", gap: "20px", textAlign: "left" }}>
                        <div style={{ backgroundColor: "rgba(34, 197, 94, 0.05)", padding: "20px", borderRadius: "15px", border: "1px solid rgba(34, 197, 94, 0.2)" }}>
                          <h4 style={{ color: "#22c55e", display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px", fontWeight: "800", fontSize: "1.1rem" }}><CheckCircle2 /> In Favour</h4>
                          <ul style={{ display: "flex", flexDirection: "column", gap: "12px", opacity: 0.9, paddingLeft: "15px", margin: 0, lineHeight: "1.5", fontSize: "0.95rem", color: "#cbd5e1" }}>
                            {topic.forPoints?.map((pt, i) => <li key={i}>{pt}</li>)}
                          </ul>
                        </div>
                        
                        <div style={{ backgroundColor: "rgba(239, 68, 68, 0.05)", padding: "20px", borderRadius: "15px", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                          <h4 style={{ color: "#ef4444", display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px", fontWeight: "800", fontSize: "1.1rem" }}><XCircle /> Against</h4>
                          <ul style={{ display: "flex", flexDirection: "column", gap: "12px", opacity: 0.9, paddingLeft: "15px", margin: 0, lineHeight: "1.5", fontSize: "0.95rem", color: "#cbd5e1" }}>
                            {topic.againstPoints?.map((pt, i) => <li key={i}>{pt}</li>)}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* --- COMPONENT VIEW B: TACTICAL INTERVIEW ACCORDIONS --- */}
                  {activeSection !== "GD" && content.map((item, index) => (
                    <div key={item.id || index} style={{ backgroundColor: "var(--card-bg)", borderRadius: "20px", border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "#1c2c45"}`, overflow: "hidden", textAlign: "left" }}>
                      <div onClick={() => setActiveFlashcard(activeFlashcard === item.id ? null : item.id)} style={{ padding: "25px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                        <h3 style={{ fontSize: isMobileView ? "1.05rem" : "1.2rem", fontWeight: "800", color: "white", margin: 0, paddingRight: "10px", lineHeight: "1.4" }}>Q{index + 1}: {item.q}</h3>
                        <div style={{ color: "white", flexShrink: 0 }}>{activeFlashcard === item.id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}</div>
                      </div>

                      <AnimatePresence>
                        {activeFlashcard === item.id && (
                          <motion.div id={`accordion-details-${item.id}`} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ borderTop: "1px solid rgba(255,255,255,0.1)", backgroundColor: "rgba(0,0,0,0.2)" }}>
                            <div style={{ padding: "25px" }}>
                              <h4 style={{ color: "#22c55e", marginBottom: "10px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px", fontSize: "1rem" }}><BrainCircuit size={18} /> Ideal AI Suggested Answer</h4>
                              <p style={{ color: "#cbd5e1", lineHeight: "1.7", margin: 0, fontSize: "0.95rem" }}>{item.a}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}

                </div>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}