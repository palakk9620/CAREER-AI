import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Sun, Moon, LogOut, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Components & Pages
import Home from "./pages/Home";
import ATSScore from "./pages/ATSScore";
import JobReadiness from "./pages/JobReadiness";
import Roadmap from "./pages/Roadmap";
import Auth from "./pages/Auth";
import Signup from "./pages/Signup";
import InterviewPrep from "./pages/InterviewPrep";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Track username as a reactive state hook to drive real-time re-renders
  const [userName, setUserName] = useState("Candidate");

  // Sync Global Theme Custom Attribute
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  // Handle Instant Page Scroll Snapping
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname]);

  // Auth Polling State Observer (Checks memory continuously for instant navigation sync)
  useEffect(() => {
    const checkAuth = () => {
      const authState = localStorage.getItem("isAuthenticated") === "true";
      setIsAuthenticated(authState);
      
      if (authState) {
        setUserName(localStorage.getItem("userFullName") || "Candidate");
      } else {
        setUserName("Candidate");
      }
    };
    checkAuth();
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = () => {
    // Clear credentials cleanly out of memory cache lanes
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userFullName");
    
    setIsAuthenticated(false);
    setUserName("Candidate");
    
    // Redirect instantly to the clean Index Home route
    navigate("/");
  };

  const pageVariants = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* DYNAMIC NAVIGATION FIXED HEADER */}
      <nav style={{
        position: "fixed", top: 0, width: "100%", zIndex: 1000,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "15px 60px", backgroundColor: "var(--header-bg)",
        borderBottom: "1px solid var(--border-color)", backdropFilter: "blur(12px)"
      }}>
        <h1
          style={{ fontSize: "1.4rem", fontWeight: "900", letterSpacing: "1px", textTransform: "uppercase", color: "#ffffff", cursor: "pointer", margin: 0 }}
          onClick={() => navigate("/")}
        >
          AI CAREER <span style={{ color: "var(--primary-accent)", marginLeft: "1px" }}>NAVIGATION</span>
        </h1>

        <div style={{ display: "flex", gap: "25px", alignItems: "center" }}>
          <AnimatePresence mode="wait">
            {!isAuthenticated ? (
              <motion.div
                key="logged-out"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                style={{ display: "flex", gap: "25px", alignItems: "center" }}
              >
                <button
                  onClick={() => navigate("/login")}
                  style={{ background: "none", border: "none", color: "#ffffff", fontWeight: "600", cursor: "pointer" }}
                >
                  Login
                </button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/signup")}
                  style={{ backgroundColor: "var(--primary-accent)", color: "white", padding: "8px 22px", borderRadius: "50px", border: "none", fontWeight: "900", cursor: "pointer" }}
                >
                  SIGN UP
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="logged-in"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                style={{ display: "flex", gap: "20px", alignItems: "center" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 18px", borderRadius: "50px", backgroundColor: "rgba(255,255,255,0.06)", color: "white", fontWeight: "bold", fontSize: "0.9rem", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <User size={16} style={{ color: "var(--primary-accent)" }} />
                  <span>Hi, {userName}</span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.03, backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSignOut}
                  style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 18px", backgroundColor: "transparent", border: "1px solid rgba(239, 68, 68, 0.4)", color: "#ef4444", borderRadius: "50px", fontWeight: "900", cursor: "pointer", fontSize: "0.9rem" }}
                >
                  <LogOut size={16} /> Sign Out
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      <div style={{ height: "75px" }}></div>

      <main style={{ flex: 1, padding: "20px 0" }}>
        <AnimatePresence>
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/ats-score" element={<ATSScore isDarkMode={isDarkMode} />} />
              <Route path="/readiness" element={<JobReadiness isDarkMode={isDarkMode} />} />
              <Route path="/roadmap" element={<Roadmap isDarkMode={isDarkMode} />} />
              <Route path="/login" element={<Auth isDarkMode={isDarkMode} />} />
              <Route path="/signup" element={<Signup isDarkMode={isDarkMode} />} />
              <Route path="/interview-prep" element={<InterviewPrep isDarkMode={isDarkMode} />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      <div style={{ height: "40px" }}></div>

      {/* THEME CONTROL TOGGLE SYSTEM */}
      <div style={{ position: "fixed", bottom: "30px", right: "30px", zIndex: 2000, transform: "scale(0.8)", transformOrigin: "bottom right" }}>
        <div className="neumorphic-toggle-container">
          <div className="switch-base" onClick={() => setIsDarkMode(!isDarkMode)}>
            <motion.div
              className="switch-handle"
              animate={{ x: isDarkMode ? 32 : 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {isDarkMode ? <Moon size={14} color="#60a5fa" /> : <Sun size={14} color="#fbbf24" />}
            </motion.div>
          </div>
        </div>
      </div>

    </div>
  );
}