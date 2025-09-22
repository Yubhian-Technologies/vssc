// src/pages/AuthPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const colleges = [
  { name: "Vishnu Institute of Technology", domain: "@vishnu.edu.in" },
  { name: "Aditya Engineering College", domain: "@aec.edu.in" },
  { name: "KL University", domain: "@kluniversity.in" },
];

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [college, setCollege] = useState(colleges[0].name);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let userCredential;

      if (isLogin) {
        // 🔹 Firebase login
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        // 🔹 Registration validation
        const selectedCollege = colleges.find((c) => c.name === college);
        if (!email.endsWith(selectedCollege.domain)) {
          setError(`Email must end with ${selectedCollege.domain}`);
          setLoading(false);
          return;
        }

        // 🔹 Firebase register
        userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // 🔹 Store user info in Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
          email: email,
          college: college,
          uid: userCredential.user.uid,
        });
      }

      // 🔹 Navigate to HeroSection after login/register
      navigate("/hero");
    } catch (err: any) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
        {/* Tabs */}
        <div className="flex justify-around mb-6 border-b">
          <button
            className={`py-2 px-4 font-medium ${
              isLogin ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"
            }`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              !isLogin ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"
            }`}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-1">Select College</label>
              <select
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full border rounded p-2"
              >
                {colleges.map((c, idx) => (
                  <option key={idx} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border rounded p-2"
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
              className="w-full border rounded p-2"
              placeholder="Enter your password"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition"
          >
            {loading ? "Processing..." : isLogin ? "Login" : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
