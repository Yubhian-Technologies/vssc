import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

import Login from "../assets/Login.png";
import VSSCLogo from "@/assets/VSSC LOGO[1].png";

const colleges = [
  { name: "Vishnu Institute of Technology", domain: "@vishnu.edu.in" },
  { name: "Vishnu Dental College", domain: "@vdc.edu.in" },
  { name: "Shri Vishnu College of Pharmacy", domain: "@svcp.edu.in" },
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
      let userCredential: any;

      if (!isLogin && password !== confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

      if (isLogin) {
        // 🔹 Login
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        navigate("/");
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
      
      
     

    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen [background-color:hsl(60,100%,95%)]">
      
      <div className="md:hidden w-full max-w-sm p-6">
        <div className="[perspective:1000px]">
          <div
            className={`relative w-full min-h-[500px] max-h-[90vh] transition-transform duration-700 [transform-style:preserve-3d] [transform-origin:center] ${
              isLogin ? "" : "[transform:rotateY(180deg)]"
            }`}
          >
           
            <div className="absolute inset-0 rounded-xl shadow-md [background-color:hsl(60,100%,90%)] [backface-visibility:hidden] overflow-hidden">
              <div className="flex flex-col items-center justify-center h-full p-5 overflow-auto">
                
                <img
                  src={VSSCLogo}
                  alt="Logo"
                  className="w-20 h-20 object-cover mb-4"
                />
                <h2 className="text-xl font-bold mb-3 text-center">Login</h2>
                <form onSubmit={handleSubmit} className="space-y-3 w-full">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
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
                  {error && isLogin && <p className="text-red-500 text-sm">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#001A66] hover:bg-blue-900 text-white py-2 rounded-md transition"
                  >
                    {loading && isLogin ? "Processing..." : "Login"}
                  </button>
                </form>
                <p className="text-center text-sm text-gray-600 mt-2">
                  Don’t have an account?{" "}
                  <button
                    onClick={() => setIsLogin(false)}
                    className="text-[#001A66] font-medium"
                  >
                    Register
                  </button>
                </p>
              </div>
            </div>

            
            <div className="absolute inset-0 rounded-xl shadow-md [background-color:hsl(60,100%,90%)] [transform:rotateY(180deg)] [backface-visibility:hidden] overflow-hidden">
              <div className="flex flex-col items-center justify-center h-full p-5 overflow-auto">
                
                <img
                  src={VSSCLogo}
                  alt="Logo"
                  className="w-16 h-16 object-cover  mb-4"
                />
                <h2 className="text-xl font-bold mb-3 text-center">Register</h2>
                <form onSubmit={handleSubmit} className="space-y-3 w-full">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    required
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
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    required
                    className="w-full border rounded-md p-2 [background-color:hsl(60,100%,95%)]"
                  />
                  {error && !isLogin && <p className="text-red-500 text-sm">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#001A66] hover:bg-blue-900 text-white py-2 rounded-md transition"
                  >
                    {loading && !isLogin ? "Processing..." : "Register"}
                  </button>
                </form>
                <p className="text-center text-sm text-gray-600 mt-2">
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
        </div>
      </div>

      
      <div
        className="hidden md:flex relative w-[800px] h-[500px] shadow-xl rounded-xl overflow-hidden"
        style={{ backgroundColor: "hsl(60,100%,90%)" }}
      >
        <div
          className={`absolute top-0 h-full w-1/2 transition-transform duration-700 ease-in-out z-20`}
          style={{ transform: isLogin ? "translateX(100%)" : "translateX(0%)" }}
        >
          <img src={Login} alt="cover" className="w-full h-full object-cover" />
        </div>

        {/* LOGIN FORM */}
        <div className="w-1/2 flex flex-col justify-center px-8 py-6 z-10">
          <h2 className="text-2xl font-bold mb-4">Login</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
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
            {error && isLogin && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#001A66] hover:bg-blue-900 text-white py-2 rounded-md transition"
            >
              {loading && isLogin ? "Processing..." : "Login"}
            </button>
          </form>

          <p className="mt-4 text-sm text-gray-600">
            Don’t have an account?{" "}
            <button onClick={() => setIsLogin(false)} className="text-[#001A66] font-medium">
              Register
            </button>
          </p>
        </div>

        {/* Register Form (Right) */}
        <div className="w-1/2 flex flex-col justify-center px-8 py-6 z-10">
          <h2 className="text-2xl font-bold mb-4">Register</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className="w-full border rounded-md p-2 [background-color:hsl(60,100%,95%)]"
              disabled={isLogin}
            />
            <select
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="w-full border rounded-md p-2 [background-color:hsl(60,100%,95%)]"
              disabled={isLogin}
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
              disabled={isLogin}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full border rounded-md p-2 [background-color:hsl(60,100%,95%)]"
              disabled={isLogin}
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className="w-full border rounded-md p-2 [background-color:hsl(60,100%,95%)]"
              disabled={isLogin}
            />
            {error && !isLogin && <p className="text-red-500 text-sm">{error}</p>}
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
