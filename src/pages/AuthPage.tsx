// AuthPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  type AuthError,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import LoginImg from "../assets/Login.png";
import { toast } from "react-hot-toast";

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

  const [isLogin, setIsLogin] = useState(true);
  const [isReset, setIsReset] = useState(false);
  const [name, setName] = useState("");
  const [college, setCollege] = useState(colleges[0].name);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect verified users only
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        navigate("/", { state: { showCongrats: true } });
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Reset Password Handler
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
      await sendPasswordResetEmail(auth, email, {
        url: "http://localhost:8080/auth",
        handleCodeInApp: false,
      });
      setError("✅ Password reset email sent! Check your inbox/spam.");
      setIsReset(false);
    } catch (err: unknown) {
      let message = "❌ Failed to send reset email.";
      if (err && typeof err === "object") {
        if (
          "message" in err &&
          typeof (err as { message?: string }).message === "string"
        ) {
          message = (err as { message: string }).message!;
        }
      }
      setError(message);
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

      navigate("/", { state: { showCongrats: true } });
    } catch (err: unknown) {
      let message = "Login failed. Please check your credentials.";
      if (err && typeof err === "object" && "message" in err) {
        message = (err as { message: string }).message;
      }
      setError(message);
    }

    setLoading(false);
  };

  // ✅ Handle Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Send verification email
      await sendEmailVerification(userCredential.user);
      console.log("Verification email sent to:", email);

      // Store user info in Firestore
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

      // ✅ Show long toast
      toast.success(
        "✅ Registration successful! A verification link has been sent to your inbox/spam. Please verify your email before logging in.",
        { duration: 6000 }
      );

      // ✅ Prevent auto-login
      await new Promise((resolve) => setTimeout(resolve, 400));
      await auth.signOut();

      // ✅ Switch to login form (stay on AuthPage)
      setIsLogin(true);
      setPassword("");
      setConfirmPassword("");
      setEmail("");
    } catch (err: unknown) {
      let message = "Registration failed.";
      if (err && typeof err === "object" && "message" in err) {
        message = (err as { message: string }).message;
      }
      setError(message);
    }

    setLoading(false);
  };

  // ✅ Resend Verification Email
  const handleResendVerification = async () => {
    try {
      const user = auth.currentUser;
      if (user && !user.emailVerified) {
        await sendEmailVerification(user);
        toast.success("📧 Verification email resent! Check your inbox/spam.");
      } else {
        toast.error(
          "Login first to resend verification or you're already verified."
        );
      }
    } catch (error) {
      toast.error("Failed to resend verification email.");
      console.error(error);
    }
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
          <img
            src={LoginImg}
            alt="cover"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Login Form */}
        <div
          className={`absolute left-0 top-0 w-1/2 h-full flex flex-col justify-center px-8 py-6 transition-all duration-700 ease-in-out ${
            isLogin && !isReset
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
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
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
              {loading ? "Processing..." : "Login"}
            </button>
          </form>

          {/* Resend Verification Email */}
          <button
            onClick={handleResendVerification}
            className="mt-3 text-sm text-blue-700 hover:underline"
          >
            Resend Verification Email
          </button>

          <p className="mt-4 text-sm text-gray-600">
            Don’t have an account?{" "}
            <button
              onClick={() => {
                setIsLogin(false);
                setError("");
              }}
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

        {/* Register Form */}
        <div
          className={`absolute right-0 top-0 w-1/2 h-full flex flex-col justify-center px-8 py-6 transition-all duration-700 ease-in-out ${
            !isLogin && !isReset
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
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full border rounded-md p-2 bg-[hsl(60,100%,95%)]"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className="w-full border rounded-md p-2 bg-[hsl(60,100%,95%)]"
            />
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

        {/* ✅ Reset Password Form (NEWLY ADDED) */}
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
      </div>
    </div>
  );
}
