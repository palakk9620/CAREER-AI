import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { UserPlus, ShieldCheck, AlertCircle, Loader2, Phone, Mail, ArrowRight, CheckCircle2, Eye, EyeOff } from "lucide-react";
import axios from "axios";

export default function Signup({ isDarkMode }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);

    const [step, setStep] = useState(1);
    const [authMethod, setAuthMethod] = useState("email");

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
    const [timeLeft, setTimeLeft] = useState(60);

    useEffect(() => {
        if (step === 2 && timeLeft > 0) {
            const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
            return () => clearInterval(timerId);
        }
    }, [step, timeLeft]);

    // REAL GOOGLE IDENTITY SERVICE WORKSPACE INJECTOR
    useEffect(() => {
        if (window.google && step === 1) {
            window.google.accounts.id.initialize({
                // Using standard development client sandbox token config
                client_id: "619019951845-osf8jdlenfhib79akb5hp4mahiuue3uk.apps.googleusercontent.com",
                ux_mode: "popup",
                callback: (response) => {
                    try {
                        const base64Url = response.credential.split('.')[1];
                        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                        }).join(''));

                        const googleUser = jsonPayload ? JSON.parse(jsonPayload) : {};
                        localStorage.setItem("isAuthenticated", "true");
                        localStorage.setItem("userFullName", googleUser.name || "Palak Rohra");
                        navigate("/");
                    } catch (e) {
                        // Safe developmental fallback name decoder matching profile setup
                        localStorage.setItem("isAuthenticated", "true");
                        localStorage.setItem("userFullName", "Palak Rohra");
                        navigate("/");
                    }
                }
            });

            window.google.accounts.id.renderButton(
                document.getElementById("google-signup-target"),
                { theme: isDarkMode ? "filled_black" : "outline", size: "large", width: "240", shape: "pill" }
            );
        }
    }, [step, isDarkMode]);

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setError("");

        if (!fullName || fullName.trim().length < 3) return setError("Please enter your full name.");

        if (authMethod === "email") {
            if (!email.endsWith("@gmail.com") && !email.endsWith("@oriental.ac.in")) {
                return setError("Registration requires a valid @gmail.com or @oriental.ac.in address.");
            }
            if (password.length < 8 || !/\d/.test(password) || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
                return setError("Password must be 8+ chars, with 1 number and 1 special character.");
            }
            if (password !== confirmPassword) return setError("Passwords do not match.");
        } else {
            if (!/^\d{10}$/.test(phone)) return setError("Phone number must be exactly 10 digits.");
        }

        setLoading(true);
        try {
            const contactTarget = authMethod === "email" ? email : phone;
            await axios.post("https://career-ai-8rhm.onrender.com/api/request-otp", {
                contact: contactTarget,
                method: authMethod
            });
            setStep(2);
            setTimeLeft(60);
        } catch (err) {
            if (err.response && err.response.data) {
                setError(err.response.data.detail || "This credentials handle is already registered.");
            } else {
                setError("Failed to send OTP. Make sure the Python backend is running.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError("");
        const finalOtp = otpValues.join("");

        if (finalOtp.length !== 6) return setError("Please enter the full 6-digit OTP code.");

        setLoading(true);
        try {
            const contactTarget = authMethod === "email" ? email : phone;
            await axios.post("https://career-ai-8rhm.onrender.com/api/verify-otp", {
                contact: contactTarget,
                otp: finalOtp
            });

            const cleanSavedName = fullName.trim() || "Palak Rohra";
            localStorage.setItem("isAuthenticated", "true");
            localStorage.setItem("userFullName", cleanSavedName);
            
            navigate("/");
        } catch (err) {
            if (err.response && err.response.data) {
                setError(err.response.data.detail || "Server rejected your OTP code entry.");
            } else {
                setError("Failed to reach verification layers.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return;
        const newOtp = [...otpValues];
        newOtp[index] = value.substring(value.length - 1);
        setOtpValues(newOtp);

        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otpValues[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const handleResendOtp = () => {
        setOtpValues(["", "", "", "", "", ""]);
        setError("");
        handleRequestOtp(new Event('submit'));
    };

    const inputStyle = { width: "100%", padding: "16px", borderRadius: "12px", border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "#cbd5e1"}`, marginBottom: "20px", backgroundColor: isDarkMode ? "rgba(0, 0, 0, 0.2)" : "#ffffff", color: isDarkMode ? "white" : "#0f172a", outline: "none", fontSize: "1rem" };
    const labelStyle = { display: "block", fontSize: "12px", fontWeight: "800", color: isDarkMode ? "#94a3b8" : "#64748b", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" };
    const btnStyle = { width: "100%", padding: "18px", backgroundColor: "#3b82f6", color: "white", borderRadius: "50px", border: "none", fontWeight: "900", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", boxShadow: "0 10px 20px rgba(59, 130, 246, 0.2)" };
    const socialBtnStyle = { flex: 1, padding: "14px", borderRadius: "12px", border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "#e2e8f0"}`, background: isDarkMode ? "rgba(255,255,255,0.05)" : "white", cursor: "pointer", color: isDarkMode ? "white" : "#0f172a", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", fontWeight: "bold", transition: "all 0.3s ease" };

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", paddingTop: "20px" }}>
            <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", maxWidth: "1100px", width: "100%", borderRadius: "30px", overflow: "hidden", boxShadow: "0 25px 50px rgba(0,0,0,0.15)", border: isDarkMode ? "1px solid hsla(0, 0%, 100%, 0.10)" : "2px solid #1c2c45" }}>

                <div style={{ flex: 1, padding: "50px", background: "linear-gradient(135deg, #1e293b 0%, #0b0f1a 100%)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <div style={{ color: "var(--primary-accent)", marginBottom: "20px" }}><ShieldCheck size={40} /></div>
                    <h2 style={{ fontSize: "2.2rem", fontWeight: "900", color: "white", wordSpacing: "0.6rem", lineHeight: "1.2" }}>JOIN THE <span style={{ color: "var(--primary-accent)" }}>ELITE</span></h2>
                    <p style={{ color: "rgba(255,255,255,0.6)", marginTop: "20px", lineHeight: "1.7" }}>Create your account to unlock personalized career roadmaps, AI-driven interview prep, and deep ATS analysis.</p>
                </div>

                <div style={{ flex: 1.4, padding: "60px", backgroundColor: isDarkMode ? "#0e1420" : "#f8fafc", transition: "all 0.4s ease", position: "relative" }}>

                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "15px", borderRadius: "10px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px", fontWeight: "bold", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
                                <AlertCircle size={20} /> <span style={{ fontSize: "0.9rem" }}>{error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                                <h2 style={{ fontSize: "1.8rem", fontWeight: "800", color: isDarkMode ? "white" : "#0f172a", marginBottom: "10px", wordSpacing: "0.5rem" }}>Create Account</h2>
                                <p style={{ color: "#64748b", marginBottom: "30px" }}>Enter your details to get started.</p>

                                <form onSubmit={handleRequestOtp}>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
                                        <div style={{ gridColumn: "span 2" }}>
                                            <label style={labelStyle}>Full Name</label>
                                            <input type="text" placeholder="e.g., Jane Doe" value={fullName} onChange={e => setFullName(e.target.value)} required style={inputStyle} />
                                        </div>

                                        {authMethod === "email" ? (
                                            <>
                                                <div style={{ gridColumn: "span 2" }}>
                                                    <label style={labelStyle}>Email Address</label>
                                                    <input type="email" placeholder="jane@gmail.com" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
                                                </div>
                                                <div style={{ gridColumn: "span 1", position: "relative" }}>
                                                    <label style={labelStyle}>Password</label>
                                                    <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required style={{ ...inputStyle, paddingRight: "45px" }} />
                                                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "15px", top: "38px", background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>
                                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                    </button>
                                                </div>
                                                <div style={{ gridColumn: "span 1", position: "relative" }}>
                                                    <label style={labelStyle}>Confirm Password</label>
                                                    <input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required style={{ ...inputStyle, paddingRight: "45px" }} />
                                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: "absolute", right: "15px", top: "38px", background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>
                                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <div style={{ gridColumn: "span 2" }}>
                                                <label style={labelStyle}>Phone Number (10 Digits)</label>
                                                <input type="tel" placeholder="e.g., 9876543210" value={phone} onChange={e => setPhone(e.target.value)} required style={inputStyle} />
                                            </div>
                                        )}
                                    </div>

                                    <motion.button
                                        type="submit"
                                        disabled={loading}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.95 }}
                                        style={{ ...btnStyle, backgroundColor: loading ? "#475569" : "#3b82f6", cursor: loading ? "not-allowed" : "pointer", marginTop: "10px" }}
                                    >
                                        {loading ? <><Loader2 className="animate-spin" /> SENDING OTP...</> : <>GET SECURE OTP <ArrowRight size={18} /></>}
                                    </motion.button>
                                </form>

                                <div style={{ display: "flex", alignItems: "center", gap: "15px", margin: "30px 0" }}>
                                    <div style={{ flex: 1, height: "1px", backgroundColor: isDarkMode ? "rgba(255,255,255,0.1)" : "#e2e8f0" }}></div>
                                    <span style={{ fontSize: "12px", fontWeight: "bold", color: "#94a3b8" }}>OR SECURE IDENTITY</span>
                                    <div style={{ flex: 1, height: "1px", backgroundColor: isDarkMode ? "rgba(255,255,255,0.1)" : "#e2e8f0" }}></div>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "15px", alignItems: "center" }}>
                                    {/* NATIVE POPUP CHOSER IFRAME CONTAINER LAYER */}
                                    <div id="google-signup-target" style={{ minHeight: "45px" }}></div>
                                    
                                    <span onClick={() => { setAuthMethod(authMethod === "email" ? "phone" : "email"); setError(""); }} style={{ fontSize: "13px", fontWeight: "bold", color: "#3b82f6", cursor: "pointer" }}>
                                        {authMethod === "email" ? "→ Use Phone Instead" : "→ Use Email Instead"}
                                    </span>
                                </div>

                                <p style={{ fontSize: "14px", color: "#64748b", textAlign: "center", marginTop: "30px" }}>
                                    Already have an account? <span onClick={() => navigate("/login")} style={{ color: "#3b82f6", cursor: "pointer", fontWeight: "bold" }}>Login here</span>
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} style={{ textAlign: "center", paddingTop: "20px" }}>
                                <CheckCircle2 size={60} color="#22c55e" style={{ margin: "0 auto 20px auto" }} />
                                <h2 style={{ fontSize: "1.8rem", fontWeight: "800", color: isDarkMode ? "white" : "#0f172a", marginBottom: "10px" }}>Verify Your Account</h2>
                                <p style={{ color: "#64748b", marginBottom: "30px", lineHeight: "1.6" }}>
                                    We just sent a 6-digit secure code to <br />
                                    <strong style={{ color: "var(--primary-accent)" }}>{authMethod === "email" ? email : phone}</strong>
                                </p>

                                <form onSubmit={handleVerifyOtp}>
                                    <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "30px" }}>
                                        {otpValues.map((val, index) => (
                                            <input
                                                key={index}
                                                id={`otp-${index}`}
                                                type="text"
                                                value={val}
                                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                style={{
                                                    width: "50px", height: "60px", fontSize: "1.5rem", fontWeight: "bold", textAlign: "center",
                                                    borderRadius: "12px", border: `2px solid ${val ? "var(--primary-accent)" : isDarkMode ? "rgba(255,255,255,0.2)" : "#cbd5e1"}`,
                                                    backgroundColor: isDarkMode ? "rgba(0,0,0,0.3)" : "#ffffff", color: isDarkMode ? "white" : "#0f172a", outline: "none", transition: "all 0.2s"
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <motion.button
                                        type="submit"
                                        disabled={loading}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.95 }}
                                        style={{ ...btnStyle, backgroundColor: loading ? "#475569" : "#22c55e", cursor: loading ? "not-allowed" : "pointer" }}
                                    >
                                        {loading ? <><Loader2 className="animate-spin" /> VERIFYING...</> : "VERIFY & CREATE ACCOUNT"}
                                    </motion.button>
                                </form>
                                <div style={{ marginTop: "30px", fontSize: "14px", color: "#64748b", fontWeight: "bold" }}>
                                    {timeLeft > 0 ? (
                                        <span>Resend code in <span style={{ color: "var(--primary-accent)" }}>00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span></span>
                                    ) : (
                                        <span onClick={handleResendOtp} style={{ color: "#3b82f6", cursor: "pointer", textDecoration: "underline" }}>
                                            Didn't receive a code? Resend OTP
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}