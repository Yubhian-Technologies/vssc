// AuthPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import LoginImg from "../assets/Login.png";
import VSSCLogo from "@/assets/VSSC LOGO[1].png";
import { toast } from "react-hot-toast";
import { useIsMobile } from "../hooks/use-mobile";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { toastError } from "@/components/ui/sonner";

const colleges = [
  { name: "Vishnu Institute of Technology", domain: "@vishnu.edu.in" },
  { name: "Vishnu Dental College", domain: "@vdc.edu.in" },
  { name: "Shri Vishnu College of Pharmacy", domain: "@svcp.edu.in" },
  { name: "BV Raju Institute of Technology", domain: "@bvrit.ac.in" },
  {
    name: "BVRIT Hyderabad College of Engineering",
    domain: "@bvrithyderabad.ac.in",
  },
  {
    name: "Shri Vishnu Engineering College for Women",
    domain: "@svecw.edu.in",
  },
];

const generateKeywords = (name: string, email: string): string[] => {
  const keywords: string[] = [];
  if (name) {
    keywords.push(name.toLowerCase());
    name.split(" ").forEach((part) => {
      if (part.trim()) keywords.push(part.toLowerCase());
    });
  }
  if (email) {
    keywords.push(email.toLowerCase());
    const localPart = email.split("@")[0];
    if (localPart) keywords.push(localPart.toLowerCase());
  }
  return [...new Set(keywords)];
};

export default function AuthPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [isLogin, setIsLogin] = useState(true);
  const [isReset, setIsReset] = useState(false);
  const [isResend, setIsResend] = useState(false); // ✅ NEW STATE for resend verification form
  const [name, setName] = useState("");
  const [college, setCollege] = useState(colleges[0].name);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirect verified users only
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        navigate("/", { state: { showCongrats: true } });
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // ✅ Reset Password Handler
  const handleResetPassword = async () => {
    setError("");

    if (!email) {
      setError("Please enter your registered email.");
      return;
    }

    const emailDomain = email.substring(email.lastIndexOf("@"));
    const validDomain = colleges.some((c) => c.domain === emailDomain);

    if (!validDomain) {
      setError("❌ Email domain is not allowed. Use your college email.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setError("✅ Password reset email sent! Check your inbox/spam.");
      setIsReset(false);
    } catch (err: any) {
      setError(err.message || "❌ Failed to send reset email.");
    }
  };

  // ✅ Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);

      if (!userCred.user.emailVerified) {
        toast.error(
          "⚠️ Please verify your email before logging in. Check your inbox/spam."
        );
        await auth.signOut();
        setLoading(false);
        return;
      }

      navigate("/");
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Password validation function
  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter.";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter.";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number.";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return "Password must contain at least one special character.";
    }
    return null;
  };

  // ✅ Handle Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if(!email || !password || !confirmPassword || !college || !name){
        toastError("Please fill all details");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        toastError("Passwords do not match.")
        setLoading(false);
        return;
      }

      const passwordError = validatePassword(password);
      if (passwordError) {
        setError(passwordError);
        
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await sendEmailVerification(userCredential.user);
      console.log("Verification email sent to:", email);

      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        name,
        email,
        college,
        role: "student",
        points: 10,
        keywords: generateKeywords(name, email),
        isNewUser: true,
      });

      localStorage.removeItem("dailyGameClaim");

      toast.success(
        "✅ Registration successful! Please verify your email before logging in.",
        { duration: 6000 }
      );

      await auth.signOut();
      setIsLogin(true);
      setPassword("");
      setConfirmPassword("");
      setEmail("");
    } catch (err: any) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Resend Verification (Email input version)
  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email) {
      setError("Please enter your registered email.");
      setLoading(false);
      return;
    }

    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);

      if (signInMethods.length === 0) {
        setError("❌ Email not registered. Please register first.");
        setLoading(false);
        return;
      }

      // Send a new verification email
      const tempUser = await signInWithEmailAndPassword(
        auth,
        email,
        password
      ).catch(() => null);

      if (tempUser && tempUser.user && !tempUser.user.emailVerified) {
        await sendEmailVerification(tempUser.user);
        toast.success("📧 Verification email sent! Check your inbox/spam.");
        await auth.signOut();
        setIsResend(false);
      } else {
        setError("⚠️ This email is already verified or invalid credentials.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to resend verification email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen [background-color:hsl(60,100%,90%)]">
      {/* Mobile Layout */}
      {isMobile ? (
        <div className="w-full max-w-md mx-4">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src={VSSCLogo} alt="VSSC Logo" className="w-20 h-20 object-contain" />
          </div>
          
          {/* Flip Container */}
          <div className="relative h-auto perspective-1000">
            <motion.div
              className="w-full p-6 bg-[hsl(60,100%,85%)] rounded-xl shadow-xl"
              initial={false}
              animate={{ rotateY: isLogin && !isReset && !isResend ? 0 : 180 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Login Form - Mobile */}
              {isLogin && !isReset && !isResend && (
                <motion.div
                  style={{ backfaceVisibility: "hidden" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      required
                      className="w-full border rounded-md p-3 bg-[hsl(60,100%,95%)]"
                    />
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                        className="w-full border rounded-md p-3 pr-10 bg-[hsl(60,100%,95%)]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {error && (
                      <p
                        className={`text-sm mt-2 ${
                          error.startsWith("✅") ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {error}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#001A66] hover:bg-blue-900 text-white py-3 rounded-md transition"
                    >
                      {loading ? "Processing..." : "Login"}
                    </button>
                  </form>

                  <button
                    onClick={() => {
                      setIsResend(true);
                      setError("");
                      setEmail("");
                    }}
                    className="mt-4 w-full text-sm text-blue-700 hover:underline"
                  >
                    Resend Verification Email
                  </button>

                  <p className="mt-4 text-sm text-gray-600 text-center">
                    Don't have an account?{" "}
                    <button
                      onClick={() => setIsLogin(false)}
                      className="text-[#001A66] font-medium"
                    >
                      Register
                    </button>
                  </p>

                  <p className="mt-3 text-sm text-gray-600 text-center">
                    Forgot your password?{" "}
                    <button
                      onClick={() => {
                        setIsReset(true);
                        setError("");
                        setEmail("");
                        setPassword("");
                        setConfirmPassword("");
                      }}
                      className="text-[#001A66] font-medium"
                    >
                      Reset Password
                    </button>
                  </p>
                </motion.div>
              )}

              {/* Register Form - Mobile */}
              {!isLogin && !isReset && !isResend && (
                <motion.div
                  style={{ 
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)"
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full border rounded-md p-3 bg-[hsl(60,100%,95%)]"
                    />
                    <select
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      className="w-full border rounded-md p-3 bg-[hsl(60,100%,95%)]"
                    >
                      {colleges.map((c, i) => (
                        <option key={i} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="College Email"
                      className="w-full border rounded-md p-3 bg-[hsl(60,100%,95%)]"
                    />
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full border rounded-md p-3 pr-10 bg-[hsl(60,100%,95%)]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      💡 Use a strong password: 8+ characters, uppercase, lowercase, numbers, and symbols
                    </p>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm Password"
                        className="w-full border rounded-md p-3 pr-10 bg-[hsl(60,100%,95%)]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {error && (
                      <p
                        className={`text-sm mt-2 ${
                          error.startsWith("✅") ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {error}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#001A66] hover:bg-blue-900 text-white py-3 rounded-md transition"
                    >
                      {loading ? "Processing..." : "Register"}
                    </button>
                  </form>

                  <p className="mt-4 text-sm text-gray-600 text-center">
                    Already have an account?{" "}
                    <button
                      onClick={() => setIsLogin(true)}
                      className="text-[#001A66] font-medium"
                    >
                      Login
                    </button>
                  </p>
                </motion.div>
              )}

              {/* Reset Password Form - Mobile */}
              {isReset && (
                <motion.div
                  style={{ 
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)"
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleResetPassword();
                    }}
                    className="space-y-4"
                  >
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your registered college email"
                      required
                      className="w-full border rounded-md p-3 bg-[hsl(60,100%,95%)]"
                    />
                    {error && (
                      <p
                        className={`text-sm mt-2 ${
                          error.startsWith("✅") ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {error}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#001A66] hover:bg-blue-900 text-white py-3 rounded-md transition"
                    >
                      {loading ? "Processing..." : "Send Reset Link"}
                    </button>
                  </form>

                  <p className="mt-4 text-sm text-gray-600 text-center">
                    Remembered your password?{" "}
                    <button
                      onClick={() => {
                        setIsReset(false);
                        setIsLogin(true);
                        setError("");
                      }}
                      className="text-[#001A66] font-medium"
                    >
                      Back to Login
                    </button>
                  </p>
                </motion.div>
              )}

              {/* Resend Verification Form - Mobile */}
              {isResend && (
                <motion.div
                  style={{ 
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)"
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-2xl font-bold mb-6 text-center">Resend Verification Email</h2>
                  <form onSubmit={handleResendVerification} className="space-y-4">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your registered college email"
                      required
                      className="w-full border rounded-md p-3 bg-[hsl(60,100%,95%)]"
                    />
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        className="w-full border rounded-md p-3 pr-10 bg-[hsl(60,100%,95%)]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {error && (
                      <p
                        className={`text-sm mt-2 ${
                          error.startsWith("✅") ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {error}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#001A66] hover:bg-blue-900 text-white py-3 rounded-md transition"
                    >
                      {loading ? "Processing..." : "Send Verification Email"}
                    </button>
                  </form>

                  <p className="mt-4 text-sm text-gray-600 text-center">
                    Back to{" "}
                    <button
                      onClick={() => {
                        setIsResend(false);
                        setIsLogin(true);
                        setError("");
                      }}
                      className="text-[#001A66] font-medium"
                    >
                      Login
                    </button>
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      ) : (
        /* Desktop Layout */
        <div
          className="relative w-[800px] h-[500px] shadow-xl rounded-xl overflow-hidden"
          style={{ backgroundColor: "hsl(60,100%,90%)" }}
        >
        {/* Image Panel */}
        <div
          className="absolute top-0 h-full w-1/2 transition-transform duration-700 ease-in-out z-20"
          style={{
            transform:
              isLogin || isReset || isResend
                ? "translateX(100%)"
                : "translateX(0%)",
          }}
        >
          <img
            src={LoginImg}
            alt="cover"
            className="w-full h-full object-cover"
          />
        </div>

        {/* ✅ Login Form */}
        <div
          className={`absolute left-0 top-0 w-1/2 h-full flex flex-col justify-center px-8 py-6 transition-all duration-700 ease-in-out ${
            isLogin && !isReset && !isResend
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <h2 className="text-2xl font-bold mb-4">Login</h2>
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full border rounded-md p-2 bg-[hsl(60,100%,95%)]"
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full border rounded-md p-2 pr-10 bg-[hsl(60,100%,95%)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <p
                className={`text-sm mt-2 ${
                  error.startsWith("✅") ? "text-green-600" : "text-red-500"
                }`}
              >
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#001A66] hover:bg-blue-900 text-white py-2 rounded-md transition"
            >
              {loading ? "Processing..." : "Login"}
            </button>
          </form>

          <button
            onClick={() => {
              setIsResend(true);
              setError("");
              setEmail("");
            }}
            className="mt-3 text-sm text-blue-700 hover:underline"
          >
            Resend Verification Email
          </button>

          <p className="mt-4 text-sm text-gray-600">
            Don’t have an account?{" "}
            <button
              onClick={() => setIsLogin(false)}
              className="text-[#001A66] font-medium"
            >
              Register
            </button>
          </p>

          <p className="mt-3 text-sm text-gray-600">
            Forgot your password?{" "}
            <button
              onClick={() => {
                setIsReset(true);
                setError("");
                setEmail("");
                setPassword("");
                setConfirmPassword("");
              }}
              className="text-[#001A66] font-medium"
            >
              Reset Password
            </button>
          </p>
        </div>

        {/* ✅ Register Form */}
        <div
          className={`absolute right-0 top-0 w-1/2 h-full flex flex-col justify-center px-8 py-6 transition-all duration-700 ease-in-out ${
            !isLogin && !isReset && !isResend
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <h2 className="text-2xl font-bold mb-4">Register</h2>
          <form onSubmit={handleRegister} className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className="w-full border rounded-md p-2 bg-[hsl(60,100%,95%)]"
            />
            <select
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="w-full border rounded-md p-2 bg-[hsl(60,100%,95%)]"
            >
              {colleges.map((c, i) => (
                <option key={i} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="College Email"
              className="w-full border rounded-md p-2 bg-[hsl(60,100%,95%)]"
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full border rounded-md p-2 pr-10 bg-[hsl(60,100%,95%)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              💡 Use a strong password: 8+ characters, uppercase, lowercase, numbers, and symbols
            </p>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className="w-full border rounded-md p-2 pr-10 bg-[hsl(60,100%,95%)]"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#001A66] hover:bg-blue-900 text-white py-2 rounded-md transition"
            >
              {loading ? "Processing..." : "Register"}
            </button>
          </form>

          <p className="mt-4 text-sm text-gray-600">
            Already have an account?{" "}
            <button
              onClick={() => setIsLogin(true)}
              className="text-[#001A66] font-medium"
            >
              Login
            </button>
          </p>
        </div>

        {/* ✅ Reset Password Form */}
        <div
          className={`absolute left-0 top-0 w-1/2 h-full flex flex-col justify-center px-8 py-6 transition-all duration-700 ease-in-out ${
            isReset ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleResetPassword();
            }}
            className="space-y-3"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered college email"
              required
              className="w-full border rounded-md p-2 bg-[hsl(60,100%,95%)]"
            />
            {error && (
              <p
                className={`text-sm mt-2 ${
                  error.startsWith("✅") ? "text-green-600" : "text-red-500"
                }`}
              >
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#001A66] hover:bg-blue-900 text-white py-2 rounded-md transition"
            >
              {loading ? "Processing..." : "Send Reset Link"}
            </button>
          </form>

          <p className="mt-4 text-sm text-gray-600">
            Remembered your password?{" "}
            <button
              onClick={() => {
                setIsReset(false);
                setIsLogin(true);
                setError("");
              }}
              className="text-[#001A66] font-medium"
            >
              Back to Login
            </button>
          </p>
        </div>

        {/* ✅ Resend Verification Form */}
        <div
          className={`absolute left-0 top-0 w-1/2 h-full flex flex-col justify-center px-8 py-6 transition-all duration-700 ease-in-out ${
            isResend ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <h2 className="text-2xl font-bold mb-4">Resend Verification Email</h2>
          <form onSubmit={handleResendVerification} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered college email"
              required
              className="w-full border rounded-md p-2 bg-[hsl(60,100%,95%)]"
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full border rounded-md p-2 pr-10 bg-[hsl(60,100%,95%)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <p
                className={`text-sm mt-2 ${
                  error.startsWith("✅") ? "text-green-600" : "text-red-500"
                }`}
              >
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#001A66] hover:bg-blue-900 text-white py-2 rounded-md transition"
            >
              {loading ? "Processing..." : "Send Verification Email"}
            </button>
          </form>

          <p className="mt-4 text-sm text-gray-600">
            Back to{" "}
            <button
              onClick={() => {
                setIsResend(false);
                setIsLogin(true);
                setError("");
              }}
              className="text-[#001A66] font-medium"
            >
              Login
            </button>
          </p>
        </div>
        </div>
      )}
    </div>
  );
}
