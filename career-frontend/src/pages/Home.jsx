import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FileText, Target, Map, ArrowUpRight } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  const features = [
    {
      id: "ats",
      title: "Check ATS Score",
      desc: "Deep-dive into how your resume matches a specific Job Description with keyword analysis.",
      icon: <FileText size={32} />,
      path: "/ats-score", // FIXED: Now goes to ATS Score
      delay: 0.2
    },
    {
      id: "readiness",
      title: "Job Readiness",
      desc: "Real-time assessment of your profile against the current competitive tech market standards.",
      icon: <Target size={32} />,
      path: "/readiness", // Stays Readiness
      delay: 0.4
    },
    {
      id: "roadmap",
      title: "AI Career Roadmap",
      desc: "Bridge the gap with a personalized, week-by-week learning path generated specifically for your goals.",
      icon: <Map size={32} />,
      path: "/roadmap", // FIXED: Now goes to Roadmap
      delay: 0.6
    }
  ];

  return (
    <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "0 40px" }}>

      {/* HERO SECTION: Balanced and Compact with 120px Top Margin */}
      <div style={{ textAlign: "center", marginBottom: "40px", marginTop: "40px" }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* PILL: 10% Bigger */}
          <span style={{
            color: "var(--primary-accent)",
            fontWeight: "800",
            textTransform: "uppercase",
            letterSpacing: "3px",
            fontSize: "14px",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            padding: "10px 25px",
            borderRadius: "50px",
            display: "inline-block"
          }}>
            AI-Powered Career Intelligence
          </span>

          {/* HEADING: 20% Smaller (clamped to 4rem) */}
          <h1 className="bold-heading" style={{
            fontSize: "clamp(2.5rem, 7vw, 3.8rem)",
            marginTop: "38px",
            lineHeight: "1", // More space between lines
            color: "var(--body-text)",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            fontWeight: "900",
            wordSpacing: "1.25rem", // THIS PUSHES THE WORDS APART
            textAlign: "center"
          }}>
            <span>Upload Your Resume</span>
            <span style={{ color: "var(--primary-accent)" }}>Dominate Your Career</span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 0.5 }}
            style={{
              fontSize: "1.1rem",
              maxWidth: "650px",
              margin: "40px auto 80px auto",
              color: "var(--body-text)",
              lineHeight: "1.8"
            }}
          >
            Stop guessing what recruiters want. Let our neural engine analyze your profile,
            score your readiness, and craft your path to the top.
          </motion.p>
        </motion.div>
      </div>

      {/* DYNAMIC FEATURE CARDS */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: "30px"
      }}>
        {features.map((feature) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: feature.delay }}
            whileHover={{ y: -15, transition: { duration: 0.2 } }}
            onClick={() => navigate(feature.path)}
            className="mediova-card"
            style={{
              padding: "50px 40px",
              borderRadius: "30px",
              cursor: "pointer",
              position: "relative",
              overflow: "hidden"
            }}
          >
            <div style={{ position: "absolute", top: "30px", right: "30px", opacity: 0.3 }}>
              <ArrowUpRight size={24} />
            </div>

            <div style={{
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              width: "70px",
              height: "70px",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "30px",
              color: "var(--primary-accent)"
            }}>
              {feature.icon}
            </div>

            <h2 style={{ fontSize: "1.7rem", fontWeight: "800", marginBottom: "15px" }}>
              {feature.title}
            </h2>
            <p style={{ fontSize: "0.95rem", opacity: 0.6, lineHeight: "1.7" }}>
              {feature.desc}
            </p>

            <div style={{
              position: "absolute",
              bottom: "-20px",
              right: "-20px",
              width: "100px",
              height: "100px",
              background: "var(--primary-accent)",
              filter: "blur(80px)",
              opacity: 0.1
            }}></div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}