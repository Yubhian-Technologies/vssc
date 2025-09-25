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
  { name: "Vishnu Dental College", domain: "@vdc.edu.in" },
  { name: "Shri Vishnu College of Pharmacy ", domain: "@svcp.edu.in" },
  { name: "BV Raju Institute of Technology", domain: "@bvrit.ac.in" },
  { name: "BVRIT Hyderabad College of Engineering", domain: "@bvrithyderabad.ac.in" },
  { name: "Shri Vishnu Engineering College for Women", domain: "@svecw.edu.in" },
];

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
        // 🔹 Firebase login
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        // 🔹 Registration validation
        const selectedCollege = colleges.find((c) => c.name === college);

        if (!email.endsWith(selectedCollege!.domain)) {
          setError(`Email must end with ${selectedCollege!.domain}`);
          setLoading(false);
          return;
        }

        // 🔹 Firebase register
        userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // 🔹 Store user info in Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
          uid: userCredential.user.uid,
          name: name,
          email: email,
          college: college,
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
    <div className="flex justify-center items-center min-h-screen [background-color:hsl(60,100%,95%)]">
      <div className="[background-color:hsl(60,100%,90%)] shadow-lg rounded-lg p-6 w-full max-w-md">
        {/* Tabs */}
        <div className="flex justify-around mb-6 border-b">
          <button
            className={`py-2 px-4 font-medium ${
              isLogin ? "border-b-2 border-primary text-primary" : "text-gray-500"
            }`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              !isLogin ? "border-b-2 border-primary text-primary" : "text-gray-500"
            }`}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full border rounded p-2 [background-color:hsl(60,100%,95%)]"
                  placeholder="Enter your name"
                />
              </div>

              
              <div>
                <label className="block text-sm font-medium mb-1">Select College</label>
                <select
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full border [background-color:hsl(60,100%,95%)] rounded p-2"
                >
                  {colleges.map((c, idx) => (
                    <option key={idx} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border rounded p-2 [background-color:hsl(60,100%,95%)]"
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
              className="w-full border rounded p-2 [background-color:hsl(60,100%,95%)]"
              placeholder="Enter your password"
            />
          </div>

          
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-1">Re-enter Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full border rounded p-2 [background-color:hsl(60,100%,95%)]"
                placeholder="Re-enter your password"
              />
            </div>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-blue-900 text-white py-2 rounded transition"
          >
            {loading ? "Processing..." : isLogin ? "Login" : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}