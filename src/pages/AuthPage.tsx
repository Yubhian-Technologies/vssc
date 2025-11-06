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
import { auth } from "../firebase";
import { toast } from "react-hot-toast";
import LoginImg from "../assets/Login.png";

const colleges = [
  { name: "Vishnu Institute of Technology", domain: "@vishnu.edu.in" },
  { name: "Vishnu Dental College", domain: "@vdc.edu.in" },
  { name: "Shri Vishnu College of Pharmacy", domain: "@svcp.edu.in" },
  { name: "BV Raju Institute of Technology", domain: "@bvrit.ac.in" },
  { name: "BVRIT Hyderabad College of Engineering", domain: "@bvrithyderabad.ac.in" },
  { name: "Shri Vishnu Engineering College for Women", domain: "@svecw.edu.in" },
];

export default function AuthPage() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [isReset, setIsReset] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [name, setName] = useState("");
  const [college, setCollege] = useState(colleges[0].name);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Auto-redirect only verified users
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await user.reload();
        if (user.emailVerified) {
          navigate("/");
        } else {
          // Unverified user — stay on the same page and show verify UI
          setShowVerify(true);
          await auth.signOut();
        }
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailFromQuery = params.get("email") || "";
    if (emailFromQuery) setEmail(emailFromQuery);
  }, []);

<<<<<<< HEAD
  // ✅ Reset Password
=======
  // ✅ Reset Password Handler
>>>>>>> 9aa7a3de3fdc45cb98848a08041f61f3277607d1
  const handleResetPassword = async () => {
    setError("");
    if (!email) return setError("Please enter your registered email.");

<<<<<<< HEAD
    const emailDomain = email.substring(email.lastIndexOf("@"));
    const validDomain = colleges.some((c) => c.domain === emailDomain);
    if (!validDomain)
      return setError("❌ Email domain is not allowed. Use your college email.");
=======
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
>>>>>>> 9aa7a3de3fdc45cb98848a08041f61f3277607d1

    try {
      await sendPasswordResetEmail(auth, email);
      setError("✅ Password reset email sent! Check your inbox/spam.");
      setIsReset(false);
<<<<<<< HEAD
    } catch (err) {
      setError(err.message || "❌ Failed to send reset email.");
    }
  };

  // ✅ Send Verification Email
  const handleSendVerification = async () => {
    if (!auth.currentUser) {
      toast.error("No user is currently logged in.");
      return;
    }
    try {
      await sendEmailVerification(auth.currentUser);
      toast.success("Verification email sent! Please check your inbox.");
    } catch (err) {
      toast.error("Failed to send verification email.");
    }
  };

  // ✅ Re-check verification status
  const handleCheckVerification = async () => {
    if (!auth.currentUser) {
      toast.error("No user is logged in.");
      return;
    }

    await auth.currentUser.reload();
    if (auth.currentUser.emailVerified) {
      toast.success("Email verified! You can now log in.");
      setShowVerify(false);
    } else {
      toast.error("Email still not verified. Please check your inbox.");
    }
  };

  // ✅ Login/Register
  const handleSubmit = async (e) => {
=======
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
>>>>>>> 9aa7a3de3fdc45cb98848a08041f61f3277607d1
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Password match check during registration
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
        // 🔹 LOGIN FLOW
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await user.reload(); // refresh emailVerified status

        if (!user.emailVerified) {
          await auth.signOut(); // Sign out immediately
          toast.error("Please verify your email before logging in.");
          setShowVerify(true);
          setLoading(false);
          return; // ⛔ stop navigation
        }

        toast.success("Login successful! Redirecting...");
        navigate("/");
      } else {
<<<<<<< HEAD
        // 🔹 REGISTER FLOW
        const emailDomain = email.substring(email.lastIndexOf("@"));
        const validDomain = colleges.some((c) => c.domain === emailDomain);
        if (!validDomain) {
          setError("❌ Email domain is not allowed. Use your college email.");
          setLoading(false);
          return;
        }
=======
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
>>>>>>> 9aa7a3de3fdc45cb98848a08041f61f3277607d1

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await sendEmailVerification(user);
        toast.success("Verification email sent! Please check your inbox.");
        setShowVerify(true);
        setError("Please verify your email before logging in.");

        await auth.signOut();
      }
<<<<<<< HEAD
    } catch (err) {
      let message = "Something went wrong";
      if (err && typeof err === "object") {
        if ("code" in err && typeof err.code === "string") {
          const authError = err;
          if (authError.code === "auth/email-already-in-use")
            message = "❌ Email already registered. Please log in.";
          else if (authError.code === "auth/invalid-credential")
            message = "❌ Invalid credentials. Please try again.";
          else message = authError.message || message;
=======
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
>>>>>>> 9aa7a3de3fdc45cb98848a08041f61f3277607d1
        }
      }

      setError(message);
    }

    setLoading(false);
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen [background-color:hsl(60,100%,95%)]">
      <div
        className="hidden md:flex relative w-[800px] h-[520px] shadow-xl rounded-xl overflow-hidden"
        style={{ backgroundColor: "hsl(60,100%,90%)" }}
      >
        {/* Image Section */}
        <div
          className="absolute top-0 h-full w-1/2 transition-transform duration-700 ease-in-out z-20"
          style={{
            transform: isLogin || isReset ? "translateX(100%)" : "translateX(0%)",
          }}
        >
          <img src={LoginImg} alt="cover" className="w-full h-full object-cover" />
        </div>

        {/* LOGIN FORM */}
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

            {showVerify && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleSendVerification}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-md transition"
                >
                  Resend Verification Email
                </button>
                <button
                  type="button"
                  onClick={handleCheckVerification}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md transition"
                >
                  Check Verification Again
                </button>
              </div>
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
            Forgot password?{" "}
            <button
              onClick={() => {
                setIsReset(true);
                setError("");
<<<<<<< HEAD
=======
                setEmail("");
                setPassword("");
                setConfirmPassword("");
>>>>>>> 9aa7a3de3fdc45cb98848a08041f61f3277607d1
              }}
              className="text-[#001A66] font-medium"
            >
              Reset
            </button>
          </p>
        </div>

        {/* RESET FORM */}
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

        {/* REGISTER FORM */}
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
            />
            <select
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="w-full border rounded-md p-2 [background-color:hsl(60,100%,95%)]"
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
              className="w-full border rounded-md p-2 [background-color:hsl(60,100%,95%)]"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full border rounded-md p-2 [background-color:hsl(60,100%,95%)]"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className="w-full border rounded-md p-2 [background-color:hsl(60,100%,95%)]"
            />
<<<<<<< HEAD

            {error && (
              <p
                className={`text-sm mt-2 ${
                  error.startsWith("✅") ? "text-green-600" : "text-red-500"
                }`}
              >
                {error}
              </p>
            )}

            {showVerify && (
              <button
                type="button"
                onClick={handleSendVerification}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-md transition"
              >
                Resend Verification Email
              </button>
            )}

=======
            {error && (
              <p className={`text-sm mt-2 ${error.startsWith("✅") ? "text-green-600" : "text-red-500"}`}>
                {error}
              </p>
            )}
>>>>>>> 9aa7a3de3fdc45cb98848a08041f61f3277607d1
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
<<<<<<< HEAD
            <button
              onClick={() => {
                setIsLogin(true);
                setError("");
              }}
              className="text-[#001A66] font-medium"
            >
=======
            <button onClick={() => setIsLogin(true)} className="text-[#001A66] font-medium">
>>>>>>> 9aa7a3de3fdc45cb98848a08041f61f3277607d1
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
