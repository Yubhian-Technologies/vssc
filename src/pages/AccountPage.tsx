import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { signOut, deleteUser, updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  User,
  Edit2,
  Settings,
  Activity,
  MessageSquare,
  Trash2,
  Camera,
  Save,
  X,
} from "lucide-react";

// Avatar Picker Component
const AvatarPicker = ({
  onSelect,
  onClose,
}: {
  onSelect: (url: string) => void;
  onClose: () => void;
}) => {
  const avatars = [
    "https://i.pravatar.cc/150?img=1",
    "https://i.pravatar.cc/150?img=2",
    "https://i.pravatar.cc/150?img=3",
    "https://i.pravatar.cc/150?img=4",
    "https://i.pravatar.cc/150?img=5",
    "https://i.pravatar.cc/150?img=6",
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Choose Profile Picture</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {avatars.map((url) => (
            <img
              key={url}
              src={url}
              alt="avatar option"
              className="w-20 h-20 rounded-full border-2 border-gray-200 cursor-pointer hover:border-blue-500 transition-all hover:scale-105"
              onClick={() => onSelect(url)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Section Card Component
const SectionCard = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-[hsl(60,100%,95%)] rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}
  >
    {children}
  </div>
);

// Section Title Component
const SectionTitle = ({
  icon: Icon,
  children,
}: {
  icon: any;
  children: React.ReactNode;
}) => (
  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
    <Icon className="w-5 h-5" />
    {children}
  </h3>
);

interface UserData {
  college: string;
  email: string;
  name?: string;
  profileUrl?: string;
  bio?: string;
}

const AccountPage = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [editName, setEditName] = useState("");
  const [editCollege, setEditCollege] = useState("");
  const [bio, setBio] = useState("");
  const [feedback, setFeedback] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const docRef = doc(db, "users", auth.currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as UserData;
          setUserData(data);
          setEditName(data.name || "");
          setEditCollege(data.college || "");
          setBio(data.bio || "");
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/auth");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleProfileUpdate = async (profileUrl: string) => {
    if (!auth.currentUser) return;
    try {
      const docRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(docRef, { ...userData, profileUrl }, { merge: true });
      setUserData((prev) => prev && { ...prev, profileUrl });
      setShowAvatarPicker(false);
    } catch (error) {
      console.error("Profile update error:", error);
      alert("Failed to update profile picture. Please try again.");
    }
  };

  const handleSaveProfile = async () => {
    if (!auth.currentUser) return;

    if (!editName.trim()) {
      alert("Name cannot be empty.");
      return;
    }

    try {
      const docRef = doc(db, "users", auth.currentUser.uid);
      const updates = {
        name: editName.trim(),
        college: editCollege.trim(),
        bio: bio.trim(),
      };

      await setDoc(docRef, { ...userData, ...updates }, { merge: true });
      await updateProfile(auth.currentUser, { displayName: editName.trim() });

      setUserData((prev) => prev && { ...prev, ...updates });
      setIsEditing(false);
      alert("✅ Profile updated successfully!");
    } catch (error) {
      console.error("Save profile error:", error);
      alert("Failed to save changes. Please try again.");
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!auth.currentUser) return;

    if (feedback.trim() === "") {
      alert("Please enter your feedback before submitting.");
      return;
    }

    try {
      const feedbackRef = doc(
        db,
        "feedbacks",
        `${auth.currentUser.uid}_${Date.now()}`
      );
      await setDoc(feedbackRef, {
        message: feedback.trim(),
        userEmail: auth.currentUser.email,
        userId: auth.currentUser.uid,
        timestamp: new Date(),
      });
      setFeedback("");
      alert("✅ Thank you for your feedback!");
    } catch (error) {
      console.error("Feedback submit error:", error);
      alert("Failed to submit feedback. Please try again.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!auth.currentUser) return;

    const confirmDelete = window.confirm(
      "⚠️ WARNING: This action is permanent and cannot be undone.\n\nAre you absolutely sure you want to delete your account?"
    );
    if (!confirmDelete) return;

    const uid = auth.currentUser.uid;
    try {
      await deleteDoc(doc(db, "users", uid));
      await deleteUser(auth.currentUser);
      alert("🗑️ Account deleted successfully.");
      navigate("/auth");
    } catch (error: any) {
      console.error("Delete account error:", error);
      if (error.code === "auth/requires-recent-login") {
        alert(
          "⚠️ For security reasons, please sign out and sign in again before deleting your account."
        );
      } else {
        alert("❌ Failed to delete account. Please try again or contact support.");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(60,100%,90%)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(60,100%,90%)]">
        <div className="text-center">
          <p className="text-lg text-gray-600">User data not found.</p>
          <button
            onClick={() => navigate("/auth")}
            className="mt-4 text-blue-600 hover:underline"
          >
            Return to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12 bg-[hsl(60,100%,90%)]">
      {/* Header Banner - Updated Layout */}
      <div className="relative h-56" style={{ background: 'linear-gradient(to right, hsl(220, 70%, 20%), hsl(220, 70%, 25%))' }}>
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          {/* Profile Section - Left Side */}
          <div className="flex items-center gap-6">
            <div className="relative group">
              {userData.profileUrl ? (
                <img
                  src={userData.profileUrl}
                  alt="Profile"
                  className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg bg-white"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-white flex items-center justify-center shadow-lg">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <button
                onClick={() => setShowAvatarPicker(true)}
                className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-colors"
                title="Change profile picture"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="text-left">
              <h1 className="text-2xl font-bold text-white">
                {userData.name || "Student"}
              </h1>
              <p className="text-blue-100 text-sm">{userData.email}</p>
              {userData.college && (
                <p className="text-blue-100 text-sm">{userData.college}</p>
              )}
            </div>
          </div>

          {/* Sign Out Button - Top Right */}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all backdrop-blur-sm border border-white border-opacity-30"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Details */}
            <SectionCard>
              <div className="flex justify-between items-start mb-4">
                <SectionTitle icon={User}>Profile Information</SectionTitle>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      College/University
                    </label>
                    <input
                      type="text"
                      value={editCollege}
                      onChange={(e) => setEditCollege(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      placeholder="Enter your college name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white"
                      rows={3}
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveProfile}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditName(userData.name || "");
                        setEditCollege(userData.college || "");
                        setBio(userData.bio || "");
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors bg-white"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="text-gray-900">{userData.name || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">College</p>
                    <p className="text-gray-900">
                      {userData.college || "Not set"}
                    </p>
                  </div>
                  {bio && (
                    <div>
                      <p className="text-sm text-gray-500">Bio</p>
                      <p className="text-gray-900">{bio}</p>
                    </div>
                  )}
                </div>
              )}
            </SectionCard>

            {/* Activities */}
            <SectionCard>
              <SectionTitle icon={Activity}>My Activities</SectionTitle>
              <p className="text-gray-600 text-sm">
                Your recent actions and contributions will appear here.
              </p>
            </SectionCard>

            {/* Feedback */}
            <SectionCard>
  <SectionTitle icon={MessageSquare}>Send Feedback</SectionTitle>
  <textarea
    value={feedback}
    onChange={(e) => setFeedback(e.target.value)}
    placeholder="Share your thoughts, suggestions, or report issues..."
    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-[hsl(60,100%,95%)]"
    rows={4}
  />
  <button
    onClick={handleFeedbackSubmit}
    className="mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
  >
    Submit Feedback
  </button>
</SectionCard>

          </div>

          {/* Right Column - Settings & Actions */}
          <div className="space-y-6">
            {/* Settings */}
            <SectionCard>
              <SectionTitle icon={Settings}>Settings</SectionTitle>
              <p className="text-gray-600 text-sm mb-4">
                Manage your account preferences.
              </p>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 hover:bg-yellow-100 rounded-lg transition-colors text-sm">
                  Privacy Settings
                </button>
                <button className="w-full text-left px-3 py-2 hover:bg-yellow-100 rounded-lg transition-colors text-sm">
                  Notifications
                </button>
                <button className="w-full text-left px-3 py-2 hover:bg-yellow-100 rounded-lg transition-colors text-sm">
                  Theme Preferences
                </button>
              </div>
            </SectionCard>

            {/* Danger Zone */}
            <SectionCard className="border-red-200 bg-red-50">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-red-600">
                <Trash2 className="w-5 h-5" />
                Danger Zone
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Permanently delete your account and all associated data.
              </p>
              <button
                onClick={handleDeleteAccount}
                className="w-full text-red-600 border border-red-300 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
              >
                Delete Account
              </button>
            </SectionCard>
          </div>
        </div>
      </div>

      {/* Avatar Picker Modal */}
      {showAvatarPicker && (
        <AvatarPicker
          onSelect={handleProfileUpdate}
          onClose={() => setShowAvatarPicker(false)}
        />
      )}
    </div>
  );
};

export default AccountPage;