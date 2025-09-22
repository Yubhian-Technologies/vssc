// src/pages/AccountPage.tsx
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";

// Simulate Bitmoji selection (replace with actual Bitmoji library or iframe)
const BitmojiPicker = ({ onSelect }: { onSelect: (url: string) => void }) => {
  const avatars = [
    "https://i.pravatar.cc/150?img=1",
    "https://i.pravatar.cc/150?img=2",
    "https://i.pravatar.cc/150?img=3",
  ];

  return (
    <div className="flex gap-4 mt-2">
      {avatars.map((url) => (
        <img
          key={url}
          src={url}
          alt="avatar"
          className="w-16 h-16 rounded-full cursor-pointer border-2 border-transparent hover:border-primary transition"
          onClick={() => onSelect(url)}
        />
      ))}
    </div>
  );
};

interface UserData {
  college: string;
  email: string;
  name?: string;
  profileUrl?: string;
  extra?: string;
}

const AccountPage = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBitmoji, setShowBitmoji] = useState(false);
  const [extra, setExtra] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const docRef = doc(db, "users", auth.currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data() as UserData);
          setExtra((docSnap.data() as UserData).extra || "");
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/auth");
  };

  const handleProfileUpdate = async (profileUrl: string) => {
    if (!auth.currentUser) return;
    const docRef = doc(db, "users", auth.currentUser.uid);

    await setDoc(docRef, { ...userData, profileUrl }, { merge: true });
    setUserData((prev) => prev && { ...prev, profileUrl });
    setShowBitmoji(false);
  };

  const handleExtraUpdate = async () => {
    if (!auth.currentUser) return;
    const docRef = doc(db, "users", auth.currentUser.uid);

    await setDoc(docRef, { ...userData, extra }, { merge: true });
    setUserData((prev) => prev && { ...prev, extra });
    alert("✅ Extra details updated!");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!userData) return <div className="min-h-screen flex items-center justify-center">User data not found.</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start pt-20 px-4">
      <div className="bg-white shadow-xl rounded-xl w-full max-w-2xl p-6 relative flex flex-col md:flex-row items-center gap-6">
        
        {/* Profile Picture */}
        <div className="flex-shrink-0 flex flex-col items-center">
          {userData.profileUrl ? (
            <img
              src={userData.profileUrl}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-2 border-primary"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 border-2 border-primary">
              <User className="w-12 h-12" />
            </div>
          )}

          <button
            className="mt-2 text-sm text-blue-500 hover:underline"
            onClick={() => setShowBitmoji(!showBitmoji)}
          >
            {showBitmoji ? "Cancel" : "Update Profile Pic"}
          </button>

          {showBitmoji && <BitmojiPicker onSelect={handleProfileUpdate} />}
        </div>

        {/* User Info */}
        <div className="flex-1 w-full">
          <h2 className="text-2xl font-bold text-gray-800">{userData.name || "Student Name"}</h2>
          <p className="text-gray-500 mt-1">{userData.email}</p>
          <p className="text-gray-500 mt-1">{userData.college}</p>

          {/* Extra details */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Extra Details</label>
            <textarea
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              className="mt-1 w-full border rounded p-2"
              placeholder="Add extra details..."
            />
            <button
              onClick={handleExtraUpdate}
              className="mt-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition"
            >
              Update Extra Details
            </button>
          </div>
        </div>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="absolute top-4 right-4 flex items-center gap-2 text-red-500 hover:text-red-600 transition"
        >
          <LogOut className="w-5 h-5" /> Sign Out
        </button>
      </div>
    </div>
  );
};

export default AccountPage;
