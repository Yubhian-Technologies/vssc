// src/pages/AuthPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

import Login from "../assets/Login.png";

const colleges = [
  { name: "Vishnu Institute of Technology", domain: "@vishnu.edu.in" },
  { name: "Vishnu Dental College", domain: "@vdc.edu.in" },
  { name: "Shri Vishnu College of Pharmacy ", domain: "@svcp.edu.in" },
  { name: "BV Raju Institute of Technology", domain: "@bvrit.ac.in" },
  { name: "BVRIT Hyderabad College of Engineering", domain: "@bvrithyderabad.ac.in" },
  { name: "Shri Vishnu Engineering College for Women", domain: "@svecw.edu.in" },
];

// 🔹 Utility function to generate keywords
const generateKeywords = (name: string, email: string) => {
  const keywords: string[] = [];

  // Full name + split parts
  if (name) {
    keywords.push(name.toLowerCase());
    name.split(" ").forEach((part) => {
      if (part.trim()) keywords.push(part.toLowerCase());
    });
  }

  // Full email
  if (email) {
    keywords.push(email.toLowerCase());

    // String before @
    const localPart = email.split("@")[0];
    if (localPart) keywords.push(localPart.toLowerCase());
  }

  // Remove duplicates
  return [...new Set(keywords)];
};

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [college, setCollege] = useState(colleges[0].name);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let userCredential;

      if (!isLogin && password !== confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

      if (isLogin) {
        // 🔹 Login
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        navigate("/hero");
      } else {
        // 🔹 Register
        const selectedCollege = colleges.find((c) => c.name === college);

        if (!email.endsWith(selectedCollege!.domain)) {
          setError(`Email must end with ${selectedCollege!.domain}`);
          setLoading(false);
          return;
        }

        userCredential = await createUserWithEmailAndPassword(auth, email, password);

        await setDoc(doc(db, "users", userCredential.user.uid), {
          uid: userCredential.user.uid,
          name: name,
          email: email,
          college: college,
          role: "student", // default role
          points : 10,
          keywords: generateKeywords(name, email), // 🔹 add keywords
        });
        navigate("/hero", { state: { showCongrats: true } });
      }
      
      
     

    } catch (err: any) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gray-100">
      <div
        className="relative w-[900px] h-[550px] shadow-2xl rounded-lg overflow-hidden flex"
        style={{ backgroundColor: "hsl(60,100%,95%)" }} // 🎨 yellow background
      >
        {/* Sliding Image Panel */}
        <div
          className={`absolute top-0 h-full w-1/2 transition-transform duration-700 ease-in-out z-20`}
          style={{
            transform: isLogin ? "translateX(100%)" : "translateX(0%)",
          }}
        >
          <img
            src={Login}
            alt="cover"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Login Form (Left) */}
        <div className="w-1/2 flex flex-col justify-center px-8 py-6 z-10">
          <h2 className="text-2xl font-bold mb-4">Login</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border rounded p-2 bg-white"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border rounded p-2 bg-white"
                placeholder="Enter your password"
              />
            </div>

            {error && isLogin && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#001A66] hover:bg-blue-900 text-white py-2 rounded transition"
            >
              {loading && isLogin ? "Processing..." : "Login"}
            </button>
          </form>

          <p className="mt-4 text-sm text-gray-600">
            Don’t have an account?{" "}
            <button
              onClick={() => setIsLogin(false)}
              className="text-[#001A66] font-medium"
            >
              Register
            </button>
          </p>
        </div>

        {/* Register Form (Right) */}
        <div className="w-1/2 flex flex-col justify-center px-8 py-6 z-10">
          <h2 className="text-2xl font-bold mb-4">Register</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
                className="w-full border rounded p-2 bg-white"
                placeholder="Enter your name"
                disabled={isLogin}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Select College
              </label>
              <select
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full border rounded p-2 bg-white"
                disabled={isLogin}
              >
                {colleges.map((c, idx) => (
                  <option key={idx} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required={!isLogin}
                className="w-full border rounded p-2 bg-white"
                placeholder="Enter your email"
                disabled={isLogin}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!isLogin}
                className="w-full border rounded p-2 bg-white"
                placeholder="Enter your password"
                disabled={isLogin}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Re-enter Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required={!isLogin}
                className="w-full border rounded p-2 bg-white"
                placeholder="Re-enter your password"
                disabled={isLogin}
              />
            </div>

            {error && !isLogin && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#001A66] hover:bg-blue-900 text-white py-2 rounded transition"
            >
              {loading && !isLogin ? "Processing..." : "Register"}
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
      </div>
    </div>
  );
}
