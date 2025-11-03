// AuthPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  type AuthError,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import LoginImg from "../assets/Login.png";

const colleges = [
  { name: "Vishnu Institute of Technology", domain: "@vishnu.edu.in" },
  { name: "Vishnu Dental College", domain: "@vdc.edu.in" },
  { name: "Shri Vishnu College of Pharmacy", domain: "@svcp.edu.in" },
  { name: "BV Raju Institute of Technology", domain: "@bvrit.ac.in" },
  { name: "BVRIT Hyderabad College of Engineering", domain: "@bvrithyderabad.ac.in" },
  { name: "Shri Vishnu Engineering College for Women", domain: "@svecw.edu.in" },
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

  const [isLogin, setIsLogin] = useState(true);
  const [isReset, setIsReset] = useState(false);
  const [name, setName] = useState("");
  const [college, setCollege] = useState(colleges[0].name);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailFromQuery = params.get("email") || "";
    if (emailFromQuery) setEmail(emailFromQuery);
    setPassword("");
    setConfirmPassword("");
  }, []);

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
      setError("❌ Email domain not allowed. Use your college email.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email, {
        url: "http://localhost:8080/auth",
        handleCodeInApp: false,
      });
      setError("✅ Password reset email sent! Check your inbox/spam.");
      setIsReset(false);
      setTimeout(() => setError(""), 5000);
    } catch (err: unknown) {
      let message = "❌ Failed to send reset email. Please try again.";

      if (err && typeof err === "object" && "code" in err) {
        const authError = err as AuthError;
        switch (authError.code) {
          case "auth/invalid-email":
            message = "❌ Invalid email format.";
            break;
          case "auth/user-not-found":
            message = "❌ No user found with this email.";
            break;
          case "auth/missing-email":
            message = "❌ Please enter your email address.";
            break;
          default:
            message = "⚠️ Unable to send reset link. Try again later.";
            break;
        }
      }

      setError(message);
    }
  };

  // ✅ Login / Register Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!isLogin && password !== confirmPassword) {
        setError("❌ Passwords do not match.");
        setLoading(false);
        return;
      }

      const emailDomain = email.substring(email.lastIndexOf("@"));
      const validDomain = colleges.some((c) => c.domain === emailDomain);

      if (!validDomain) {
        setError("❌ Only college emails are allowed for registration/login.");
        setLoading(false);
        return;
      }

      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        navigate("/");
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
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
        console.log("Cleared dailyGameClaim on registration");
        navigate("/", { state: { showCongrats: true } });
      }
    } catch (err: unknown) {
      let message = "⚠️ Something went wrong. Please try again.";

      if (err && typeof err === "object" && "code" in err) {
        const authError = err as AuthError;
        switch (authError.code) {
          case "auth/invalid-email":
            message = "❌ Please enter a valid email address.";
            break;
          case "auth/user-disabled":
            message = "❌ This account has been disabled. Contact admin.";
            break;
          case "auth/user-not-found":
            message = "❌ No account found with this email.";
            break;
          case "auth/wrong-password":
            message = "❌ Incorrect password. Please try again.";
            break;
          case "auth/email-already-in-use":
            message = "❌ Email already registered. Please log in.";
            break;
          case "auth/weak-password":
            message = "❌ Password too weak. Use at least 6 characters.";
            break;
          case "auth/missing-password":
            message = "❌ Please enter your password.";
            break;
          case "auth/wrong-password":
            message = "❌ Incorrect password. Please try again.";
            break;
          default:
            message = "⚠️ Unexpected error. Please try again later.";
            break;
        }
      }

      setError(message);
    }

    setLoading(false);
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen [background-color:hsl(60,100%,95%)]">
      <div
        className="hidden md:flex relative w-[800px] h-[500px] shadow-xl rounded-xl overflow-hidden"
        style={{ backgroundColor: "hsl(60,100%,90%)" }}
      >
        {/* Image Panel */}
        <div
          className="absolute top-0 h-full w-1/2 transition-transform duration-700 ease-in-out z-20"
          style={{
            transform:
              isLogin || isReset ? "translateX(100%)" : "translateX(0%)",
          }}
        >
          <img src={LoginImg} alt="cover" className="w-full h-full object-cover" />
        </div>

        {/* Login Form */}
        <div
          className={`absolute left-0 top-0 w-1/2 h-full flex flex-col justify-center px-8 py-6 transition-all duration-700 ease-in-out ${
            isLogin && !isReset ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8 pointer-events-none"
          }`}
        >
          <h2 className="text-2xl font-bold mb-4">Login</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="College Email"
              required
              className="w-full border rounded-md p-2 [background-color:hsl(60,100%,95%)]"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full border rounded-md p-2 [background-color:hsl(60,100%,95%)]"
            />
            {error && (
              <p className={`text-sm mt-2 ${error.startsWith("✅") ? "text-green-600" : "text-red-500"}`}>
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
          <p className="mt-4 text-sm text-gray-600">
            Don’t have an account?{" "}
            <button onClick={() => { setIsLogin(false); setError(""); }} className="text-[#001A66] font-medium">
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

        {/* Reset Form */}
        <div
          className={`absolute left-0 top-0 w-1/2 h-full flex flex-col justify-center px-8 py-6 transition-all duration-700 ease-in-out ${
            isReset ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
          }`}
        >
          <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your registered email"
            className="w-full border rounded-md p-2 [background-color:hsl(60,100%,95%)] mb-[5px]"
            required
          />
          {error && (
            <p className={`text-sm mt-2 ${error.startsWith("✅") ? "text-green-600" : "text-red-500"}`}>
              {error}
            </p>
          )}
          <button
            onClick={handleResetPassword}
            disabled={loading}
            className="w-full bg-[#001A66] hover:bg-blue-900 text-white py-2 rounded-md transition"
          >
            {loading ? "Sending..." : "Reset Password"}
          </button>
          <button
            onClick={() => setIsReset(false)}
            className="w-full bg-gray-300 hover:bg-gray-400 text-black py-2 rounded-md transition mt-2"
          >
            Back to Login
          </button>
        </div>

        {/* Register Form */}
        <div
          className={`absolute right-0 top-0 w-1/2 h-full flex flex-col justify-center px-8 py-6 transition-all duration-700 ease-in-out ${
            !isLogin && !isReset ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <h2 className="text-2xl font-bold mb-4">Register</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className="w-full border rounded-md p-2 [background-color:hsl(60,100%,95%)]"
              disabled={isLogin || isReset}
            />
            <select
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="w-full border rounded-md p-2 [background-color:hsl(60,100%,95%)]"
              disabled={isLogin || isReset}
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
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="College Email"
              className="w-full border rounded-md p-2 [background-color:hsl(60,100%,95%)]"
              disabled={isLogin || isReset}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full border rounded-md p-2 [background-color:hsl(60,100%,95%)]"
              disabled={isLogin || isReset}
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className="w-full border rounded-md p-2 [background-color:hsl(60,100%,95%)]"
              disabled={isLogin || isReset}
            />
            {error && (
              <p className={`text-sm mt-2 ${error.startsWith("✅") ? "text-green-600" : "text-red-500"}`}>
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#001A66] hover:bg-blue-900 text-white py-2 rounded-md transition"
            >
              {loading && !isLogin ? "Processing..." : "Register"}
            </button>
          </form>
          <p className="mt-4 text-sm text-gray-600">
            Already have an account?{" "}
            <button onClick={() => setIsLogin(true)} className="text-[#001A66] font-medium">
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
