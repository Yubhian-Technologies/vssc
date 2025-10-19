
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { signOut, deleteUser, updateProfile, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { toastSuccess,toastError } from "@/components/ui/sonner";
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
  Plus,
  Upload,
  Minus,
  Lock,
} from "lucide-react";
import { uploadToCloudinary } from "../utils/cloudinary";

// Avatar Picker Component
const AvatarPicker = ({
  onSelect,
  onClose,
}: {
  onSelect: (url: string) => void;
  onClose: () => void;
}) => {
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const avatars = [
    "https://cdn-icons-png.flaticon.com/512/3135/3135823.png",
    "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    "https://cdn-icons-png.flaticon.com/512/3135/3135768.png",
    "https://cdn-icons-png.flaticon.com/512/3135/3135789.png",
    "https://cdn-icons-png.flaticon.com/512/3135/3135739.png",
    "https://cdn-icons-png.flaticon.com/512/3135/3135755.png"
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setScale(1);
      setPosition({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAdjustedImage = async () => {
    if (!selectedImage) return;
    
    setUploading(true);
    try {
      // Validate data URL format
      if (!selectedImage.startsWith('data:image/')) {
        throw new Error('Invalid image format');
      }
      
      // Convert data URL to blob
      const response = await fetch(selectedImage);
      if (!response.ok) {
        throw new Error('Failed to process image');
      }
      
      const blob = await response.blob();
      const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
      
      const imageUrl = await uploadToCloudinary(file);
      if (!imageUrl) {
        throw new Error('Upload failed');
      }
      
      onSelect(imageUrl);
    } catch (error) {
      console.error('Upload failed:', error);
      toastError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[hsl(60,100%,95%)] rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{selectedImage ? 'Adjust Photo' : 'Upload Profile'}</h3>
          <button
            onClick={() => {
              setSelectedImage(null);
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {selectedImage ? (
          /* Photo Adjustment View */
          <div className="space-y-4">
            <div className="relative w-64 h-64 mx-auto bg-gray-100 rounded-full overflow-hidden border-4 border-gray-300">
              <img
                src={selectedImage}
                alt="Selected"
                className="absolute inset-0 w-full h-full object-cover"
                style={{
                  transform: `scale(${Math.max(0.1, Math.min(5, scale))}) translate(${Math.max(-100, Math.min(100, position.x))}px, ${Math.max(-100, Math.min(100, position.y))}px)`
                }}
              />
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Zoom</label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={scale}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value)) setScale(value);
                  }}
                  className="w-full"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Position X</label>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={position.x}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value)) setPosition(prev => ({ ...prev, x: value }));
                    }}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Position Y</label>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={position.y}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value)) setPosition(prev => ({ ...prev, y: value }));
                    }}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedImage(null)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSaveAdjustedImage}
                disabled={uploading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {uploading ? 'Saving...' : 'Done'}
              </button>
            </div>
          </div>
        ) : (
          /* Upload/Select View */
          <>
            <div className="mb-4 flex gap-2">
              <label className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => onSelect('')}
                className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Remove
              </button>
            </div>
            
            <div className="border-t pt-4">
              <p className="text-sm text-gray-500 mb-3">Or choose from presets:</p>
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
          </>
        )}
      </div>
    </div>
  );
};

// ✅ Fixed template string syntax here
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

interface Experience {
  title: string;
  description: string;
  duration?: string;
}

interface Club {
  name: string;
  proofUrl?: string;
}

interface UserData {
  name?: string;
  email: string;
  college?: string;
  graduationYear?: string;
  department?: string;
  section?: string;
  bio?: string;
  profileUrl?: string;
  github?: string;
  hackerRank?: string;
  linkedIn?: string;
  resumeDrive?: string;
  experiences?: Experience[];
  clubs?: Club[];
  skills?: string[];
  accounts?: { platform: string; url: string }[]; // ✅ Added accounts field
}

const AccountPage = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [editName, setEditName] = useState("");
  const [editCollege, setEditCollege] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [department, setDepartment] = useState("");
  const [section, setSection] = useState("");
  const [bio, setBio] = useState("");
  const [github, setGithub] = useState("");
  const [hackerRank, setHackerRank] = useState("");
  const [linkedIn, setLinkedIn] = useState("");
  const [resumeDrive, setResumeDrive] = useState("");
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<{ platform: string; url: string }[]>([]);
  const [feedback, setFeedback] = useState<string>(""); // ✅ Add this
  const [reservations, setReservations] = useState<{ name: string }[]>([]);


  const navigate = useNavigate();

  // ✅ Fetch accounts from Firestore along with other fields
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
          setGraduationYear(data.graduationYear || "");
          setDepartment(data.department || "");
          setSection(data.section || "");
          setGithub(data.github || "");
          setHackerRank(data.hackerRank || "");
          setLinkedIn(data.linkedIn || "");
          setResumeDrive(data.resumeDrive || "");
          setExperiences(data.experiences || []);
          setClubs(data.clubs || []);
          setSkills(data.skills || []);
          setAccounts(data.accounts || []); // ✅ Fix: load accounts from Firestore
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
      toastError("Failed to update profile picture. Please try again.");
    }
  };

  // ✅ Save accounts when updating profile
  const handleSaveProfile = async () => {
    if (!auth.currentUser) return;

    if (!editName.trim()) {
      toastError("Name cannot be empty.");
      return;
    }

    try {
      const docRef = doc(db, "users", auth.currentUser.uid);
      const updates = {
        name: editName.trim(),
        college: editCollege.trim(),
        graduationYear: graduationYear.trim(),
        department: department.trim(),
        section: section.trim(),
        bio: bio.trim(),
        github: github.trim(),
        hackerRank: hackerRank.trim(),
        linkedIn: linkedIn.trim(),
        resumeDrive: resumeDrive.trim(),
        experiences,
        clubs,
        skills,
        accounts, // ✅ Save accounts to Firestore
      };

      await setDoc(docRef, { ...userData, ...updates }, { merge: true });
      await updateProfile(auth.currentUser, { displayName: editName.trim() });

      setUserData((prev) => prev && { ...prev, ...updates });
      setIsEditing(false);
      toastSuccess("✅ Profile updated successfully!");
    } catch (error) {
      console.error("Save profile error:", error);
      toastError("Failed to save changes. Please try again.");
    }
  };

  const handleAddExperience = () => {
    setExperiences([...experiences, { title: "", description: "" }]);
  };

  const handleInsertExperienceAfter = (index: number) => {
    const newExp = [...experiences];
    newExp.splice(index + 1, 0, { title: "", description: "" });
    setExperiences(newExp);
  };

  const handleUpdateExperience = (index: number, field: string, value: string) => {
    const newExp = [...experiences];
    newExp[index] = { ...newExp[index], [field]: value };
    setExperiences(newExp);
  };

  const handleDeleteExperience = (index: number) => {
    const newExp = [...experiences];
    newExp.splice(index, 1);
    setExperiences(newExp);
  };

  const handleAddClub = () => {
    setClubs([...clubs, { name: "", proofUrl: "" }]);
  };

  const handleInsertClubAfter = (index: number) => {
    const newClubs = [...clubs];
    newClubs.splice(index + 1, 0, { name: "", proofUrl: "" });
    setClubs(newClubs);
  };

  const handleUpdateClub = (index: number, field: string, value: string) => {
    const newClubs = [...clubs];
    newClubs[index] = { ...newClubs[index], [field]: value };
    setClubs(newClubs);
  };

  const handleDeleteClub = (index: number) => {
    const newClubs = [...clubs];
    newClubs.splice(index, 1);
    setClubs(newClubs);
  };
  const handleAddReservation = () => setReservations([...reservations, { name: "" }]);
const handleUpdateReservation = (idx: number, value: string) => {
  const newRes = [...reservations];
  newRes[idx].name = value;
  setReservations(newRes);
};
const handleDeleteReservation = (idx: number) => setReservations(reservations.filter((_, i) => i !== idx));
  

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
      {/* Header */}
      <div
  className="relative h-48 sm:h-56"
  style={{
    background: "linear-gradient(to right, hsl(220, 70%, 20%), hsl(220, 70%, 25%))",
  }}
>
  <div className="max-w-7xl mx-auto px-4 h-full">
    {/* Desktop Layout */}
    <div className="hidden sm:flex items-center justify-between gap-4 h-full">
      {/* Left side: Avatar + Info */}
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative cursor-pointer" onClick={() => setShowAvatarPicker(true)} title="Change profile picture">
          {userData.profileUrl ? (
            <img
              src={userData.profileUrl}
              alt="Profile"
              className="w-28 h-28 rounded-full border-4 border-white object-cover shadow-lg bg-white hover:opacity-80 transition-opacity"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-gray-100 border-4 border-white flex items-center justify-center shadow-lg hover:bg-gray-200 transition-colors">
              <User className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center">
          <h1 className="text-2xl font-bold text-white">
            {userData.name || "Student"}
          </h1>
          <p className="text-blue-100 text-sm truncate">{userData.email}</p>
          {userData.college && (
            <p className="text-blue-100 text-sm truncate">{userData.college}</p>
          )}
        </div>
      </div>

      {/* Right side: Reservations & Sign Out */}
      <div className="flex-shrink-0 flex gap-2">
        <button
          onClick={() => navigate("/reservations")}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-lg transition-all backdrop-blur-sm border border-white border-opacity-30 text-sm"
        >
          Reservations
        </button>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-lg transition-all backdrop-blur-sm border border-white border-opacity-30 text-sm"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>

    {/* Mobile Layout */}
    <div className="sm:hidden flex flex-col justify-center h-full">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative cursor-pointer" onClick={() => setShowAvatarPicker(true)} title="Change profile picture">
          {userData.profileUrl ? (
            <img
              src={userData.profileUrl}
              alt="Profile"
              className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-lg bg-white hover:opacity-80 transition-opacity"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-100 border-4 border-white flex items-center justify-center shadow-lg hover:bg-gray-200 transition-colors">
              <User className="w-10 h-10 text-gray-400" />
            </div>
          )}
        </div>

        {/* Info + Buttons */}
        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-lg font-bold text-white">
            {userData.name || "Student"}
          </h1>
          <p className="text-blue-100 text-sm truncate">{userData.email}</p>
          {userData.college && (
            <p className="text-blue-100 text-sm truncate mb-2">{userData.college}</p>
          )}
          
          {/* Buttons under name/email */}
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => navigate("/reservations")}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-lg transition-all backdrop-blur-sm border border-white border-opacity-30 text-sm"
            >
              Reservations
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-lg transition-all backdrop-blur-sm border border-white border-opacity-30 text-sm"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>


      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 mt-6 sm:mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Info */}
            <SectionCard>
  <div className="flex justify-between items-start mb-4">
    <SectionTitle icon={User}>Profile Information</SectionTitle>
    {!isEditing && (
      <button
        onClick={() => setIsEditing(true)}
        className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium transition-colors"
      >
        <Edit2 className="w-4 h-4" />
        Edit
      </button>
    )}
  </div>

  {isEditing ? (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[hsl(60,100%,95%)]"
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
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[hsl(60,100%,95%)]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Graduation Year
          </label>
          <input
            type="text"
            value={graduationYear}
            onChange={(e) => setGraduationYear(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[hsl(60,100%,95%)]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department
          </label>
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[hsl(60,100%,95%)]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Section
          </label>
          <input
            type="text"
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[hsl(60,100%,95%)]"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bio
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 resize-none bg-[hsl(60,100%,95%)]"
          rows={3}
        />
      </div>
    </div>
  ) : (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-gray-500">Name</p>
        <p className="text-gray-900">{userData.name || "Not set"}</p>
      </div>
      <div>
        <p className="text-sm text-gray-500">College</p>
        <p className="text-gray-900">{userData.college || "Not set"}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {userData.graduationYear && (
          <div>
            <p className="text-sm text-gray-500">Graduation Year</p>
            <p className="text-gray-900">{userData.graduationYear}</p>
          </div>
        )}
        {userData.department && (
          <div>
            <p className="text-sm text-gray-500">Department</p>
            <p className="text-gray-900">{userData.department}</p>
          </div>
        )}
        {userData.section && (
          <div>
            <p className="text-sm text-gray-500">Section</p>
            <p className="text-gray-900">{userData.section}</p>
          </div>
        )}
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


          
            {/* Accounts & Links */}
           
           <SectionCard>
  <SectionTitle icon={Settings}>Accounts & Links</SectionTitle>

  {accounts.length === 0 && (
    <p className="text-gray-600 text-sm mb-4 text-center">
      No accounts added yet.
    </p>
  )}

  {isEditing ? (
    <div className="space-y-3">
      {accounts.map((account, idx) => (
        <div
          key={idx}
          className="flex flex-col sm:flex-row sm:items-center gap-2 border border-gray-200 rounded-lg p-3 shadow-sm bg-[hsl(60,100%,95%)]"
        >
          {/* Platform */}
          <input
            type="text"
            value={account.platform}
            onChange={(e) => {
              const newAccounts = [...accounts];
              newAccounts[idx].platform = e.target.value;
              setAccounts(newAccounts);
            }}
            placeholder="Platform (e.g. GitHub, LinkedIn)"
            className="flex-1 border border-gray-300 rounded px-3 py-1.5 focus:ring-2 focus:ring-blue-500 bg-[hsl(60,100%,95%)]"
          />

          {/* URL */}
          <input
            type="url"
            value={account.url}
            onChange={(e) => {
              const newAccounts = [...accounts];
              newAccounts[idx].url = e.target.value;
              setAccounts(newAccounts);
            }}
            placeholder="Profile URL"
            className="flex-1 border border-gray-300 rounded px-3 py-1.5 focus:ring-2 focus:ring-blue-500 bg-[hsl(60,100%,95%)]"
          />

          {/* Delete Button */}
          <button
            onClick={() => {
              const updated = accounts.filter((_, i) => i !== idx);
              setAccounts(updated);
            }}
            className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-full transition duration-200 flex items-center justify-center"
          >
            <Minus className="w-5 h-5 font-bold" />
          </button>
        </div>
      ))}

      {/* Add Account Button */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() =>
            setAccounts([...accounts, { platform: "", url: "" }])
          }
          className="bg-blue-100 hover:bg-blue-200 text-blue-800 p-2 rounded-full transition duration-200 flex items-center justify-center"
        >
          <Plus className="w-5 h-5 font-bold" />
        </button>
      </div>
    </div>
  ) : (
    <div className="flex flex-col gap-2">
      {accounts.map((account, idx) => (
        <a
          key={idx}
          href={account.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between bg-blue-100 text-blue-800 font-medium px-3 py-2 rounded-lg shadow-sm hover:bg-blue-200 transition"
        >
          <span>{account.platform}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-blue-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </a>
      ))}
    </div>
  )}
</SectionCard>
{/* Reservations*
<SectionCard>
  <SectionTitle icon={Activity}>Reservations</SectionTitle>

  {reservations.length === 0 && !isEditing && (
    <p className="text-gray-600 text-sm mb-4 text-center">
      No reservations yet.
    </p>
  )}

  {isEditing ? (
    <div className="space-y-3">
      {reservations.map((res, idx) => (
        <div key={idx} className="border border-gray-200 rounded-lg p-3 shadow-sm bg-[hsl(60,100%,95%)]">
          <input
            type="text"
            value={res.name}
            onChange={(e) => handleUpdateReservation(idx, e.target.value)}
            placeholder="Reservation Name"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 bg-[hsl(60,100%,95%)]"
          />
          <button onClick={() => handleDeleteReservation(idx)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded mt-2">
            Delete
          </button>
        </div>
      ))}
      <div className="flex justify-center mt-4">
        <button onClick={handleAddReservation} className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg shadow">
          Add Reservation
        </button>
      </div>
    </div>
  ) : (
    <div className="space-y-2">
      {reservations.map((res, idx) => (
        <p key={idx} className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg">{res.name}</p>
      ))}
    </div>
  )}
</SectionCard>*/}




            {/* Skills */}
            <SectionCard>
  <SectionTitle icon={Activity}>Skills</SectionTitle>

  {skills.length === 0 && (
    <p className="text-gray-600 text-sm mb-4 text-center">No skills added yet.</p>
  )}

  {isEditing ? (
    <div className="space-y-3">
      {skills.map((skill, idx) => (
        <div
          key={idx}
          className="flex items-center gap-2 border border-gray-200 rounded-lg p-2 shadow-sm bg-[hsl(60,100%,95%)]"
        >
          <input
            type="text"
            value={skill}
            onChange={(e) => {
              const newSkills = [...skills];
              newSkills[idx] = e.target.value;
              setSkills(newSkills);
            }}
            placeholder="Enter skill"
            className="flex-1 border border-gray-300 rounded px-3 py-1.5 focus:ring-2 focus:ring-blue-500 bg-[hsl(60,100%,95%)]"
          />
          <button
            onClick={() => {
              const newSkills = skills.filter((_, i) => i !== idx);
              setSkills(newSkills);
            }}
            className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-full transition duration-200 flex items-center justify-center"
          >
            <Minus className="w-5 h-5 font-bold" />
          </button>
        </div>
      ))}

      {/* Add Skill Button Centered */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => setSkills([...skills, ""])}
          className="bg-blue-100 hover:bg-blue-200 text-blue-800 p-2 rounded-full transition duration-200 flex items-center justify-center"
        >
          <Plus className="w-5 h-5 font-bold" />
        </button>
      </div>
    </div>
  ) : (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill, idx) => (
        <span
          key={idx}
          className="bg-blue-100 text-blue-800 font-medium px-3 py-1 rounded-full shadow-sm"
        >
          {skill}
        </span>
      ))}
    </div>
  )}
</SectionCard>


            {/* Experiences */}
            <SectionCard>
  <SectionTitle icon={Activity}>Experiences</SectionTitle>

  {experiences.length === 0 && !isEditing && (
    <p className="text-gray-600 text-sm mb-4 text-center">
      No experiences added yet.
    </p>
  )}

  <div className="space-y-4">
    {experiences.map((exp, idx) => (
      <div
        key={idx}
        className="border border-gray-200 rounded-lg p-4 shadow-sm bg-[hsl(60,100%,95%)]"
      >
        {isEditing ? (
          <>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={exp.title}
                onChange={(e) =>
                  handleUpdateExperience(idx, "title", e.target.value)
                }
                placeholder="Title"
                className="flex-1 border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 bg-[hsl(60,100%,95%)]"
              />
              <input
                type="text"
                value={exp.duration || ""}
                onChange={(e) =>
                  handleUpdateExperience(idx, "duration", e.target.value)
                }
                placeholder="Duration"
                className="w-36 border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 bg-[hsl(60,100%,95%)]"
              />
            </div>
            <textarea
              value={exp.description}
              onChange={(e) =>
                handleUpdateExperience(idx, "description", e.target.value)
              }
              placeholder="Description"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-2 focus:ring-2 focus:ring-blue-500 bg-[hsl(60,100%,95%)] resize-none"
              rows={3}
            />

            {/* Delete Button */}
            <div className="flex justify-end mt-2">
              <button
                onClick={() => handleDeleteExperience(idx)}
                className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-full transition duration-200 flex items-center justify-center"
              >
                <Minus className="w-5 h-5 font-bold" />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <p className="font-semibold text-gray-800">{exp.title}</p>
              {exp.duration && (
                <p className="text-xs text-gray-500">{exp.duration}</p>
              )}
            </div>
            <p className="text-gray-700 mt-2">{exp.description}</p>
          </>
        )}
      </div>
    ))}

    {/* Add Experience Button at bottom */}
    {isEditing && (
      <div className="flex justify-center mt-4">
        <button
          onClick={handleAddExperience}
          className="bg-blue-100 hover:bg-blue-200 text-blue-800 p-2 rounded-full transition duration-200 flex items-center justify-center"
        >
          <Plus className="w-5 h-5 font-bold" />
        </button>
      </div>
    )}
  </div>
</SectionCard>


            {/* Clubs */}
            <SectionCard>
  <SectionTitle icon={User}>Clubs & Memberships</SectionTitle>

  {clubs.length === 0 && !isEditing && (
    <p className="text-gray-600 text-sm mb-4 text-center">No clubs added yet.</p>
  )}

  {isEditing ? (
    <div className="space-y-4">
      {clubs.map((club, idx) => (
        <div
          key={idx}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center border border-gray-200 rounded-lg p-4 shadow-sm bg-[hsl(60,100%,95%)]"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" >
              Club Name
            </label>
            <input
              type="text"
              value={club.name}
              onChange={(e) => handleUpdateClub(idx, "name", e.target.value)}
              placeholder="Club Name"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 bg-[hsl(60,100%,95%)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proof URL
            </label>
            <input
              type="url"
              value={club.proofUrl || ""}
              onChange={(e) => handleUpdateClub(idx, "proofUrl", e.target.value)}
              placeholder="https://example.com/proof"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 bg-[hsl(60,100%,95%)]"
            />
          </div>

          <div className="sm:col-span-2 flex justify-center mt-2">
            <button
              onClick={() => handleDeleteClub(idx)}
              className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-full transition duration-200 flex items-center justify-center"
            >
              <Minus className="w-5 h-5 font-bold" />
            </button>
          </div>
        </div>
      ))}

      <div className="flex justify-center mt-4">
        <button
          onClick={handleAddClub}
          className="bg-blue-100 hover:bg-blue-200 text-blue-800 p-2 rounded-full transition duration-200 flex items-center justify-center"
        >
          <Plus className="w-5 h-5 font-bold" />
        </button>
      </div>
    </div>
  ) : (
    <div className="space-y-3">
      {clubs.map((club, idx) => (
        <a
          key={idx}
          href={club.proofUrl || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex justify-between items-center bg-gray-100 hover:bg-gray-200 transition-colors px-4 py-3 rounded-lg shadow-sm font-medium break-words"
        >
          <span>{club.name}</span>
          {club.proofUrl && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          )}
        </a>
      ))}
    </div>
  )}
</SectionCard>

          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Change Password */}
            <SectionCard>
              <SectionTitle icon={Lock}>Change Password</SectionTitle>
              <button
                onClick={async () => {
                  if (!auth.currentUser) return;
                  
                  const currentPassword = prompt("Enter your current password:");
                  if (!currentPassword || currentPassword.trim().length === 0) return;
                  
                  const newPassword = prompt("Enter your new password:");
                  if (!newPassword || newPassword.trim().length === 0) return;
                  
                  if (newPassword.length < 6) {
                    toastError("Password must be at least 6 characters long.");
                    return;
                  }
                  
                  try {
                    const credential = EmailAuthProvider.credential(auth.currentUser.email!, currentPassword);
                    await reauthenticateWithCredential(auth.currentUser, credential);
                    await updatePassword(auth.currentUser, newPassword);
                    toastSuccess("Password updated successfully!");
                  } catch (error) {
                    console.error("Password update error:", error);
                    toastError("Failed to update password. Please check your current password.");
                  }
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
              >
                Change Password
              </button>
            </SectionCard>

            {/* Feedback */}
            <SectionCard>
              <SectionTitle icon={MessageSquare}>Send Feedback</SectionTitle>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your thoughts, suggestions, or report issues..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 resize-none bg-[hsl(60,100%,95%)]"
                rows={4}
              />
              <button
                onClick={async () => {
                  if (!feedback.trim()) {
                    toastError("Please enter your feedback before submitting.");
                    return;
                  }
                  
                  try {
                    const feedbackDoc = {
                      userId: auth.currentUser?.uid,
                      userEmail: auth.currentUser?.email,
                      userName: userData.name || "Anonymous",
                      feedback: feedback.trim(),
                      timestamp: new Date().toISOString(),
                      status: "pending"
                    };
                    
                    await setDoc(doc(db, "feedback", `${auth.currentUser?.uid}_${Date.now()}`), feedbackDoc);
                    setFeedback("");
                    toastSuccess("Feedback submitted successfully! Thank you for your input.");
                  } catch (error) {
                    console.error("Feedback submission error:", error);
                    toastError("Failed to submit feedback. Please try again.");
                  }
                }}
                className="mt-3 w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Submit Feedback
              </button>
            </SectionCard>

            {/* Delete Account */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-red-600">
                <Trash2 className="w-5 h-5" />
                Delete Account
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <button
                onClick={async () => {
                  if (!auth.currentUser) return;
                  const confirmDelete = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
                  if (!confirmDelete) return;
                  
                  const password = prompt("Please enter your password to confirm account deletion:");
                  if (!password || password.trim().length === 0) return;
                  
                  try {
                    const credential = EmailAuthProvider.credential(auth.currentUser.email!, password);
                    await reauthenticateWithCredential(auth.currentUser, credential);
                    await deleteDoc(doc(db, "users", auth.currentUser.uid));
                    await deleteUser(auth.currentUser);
                    toastSuccess("Account deleted successfully!");
                    navigate("/auth");
                  } catch (error) {
                    console.error("Delete account error:", error);
                    toastError("Failed to delete account. Please check your password and try again.");
                  }
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
              >
                Delete Account
              </button>
            </div>

          
            {/* Danger Zone Section 
<SectionCard className="border-red-200 bg-red-50 mt-6">
  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-red-600">
    <Trash2 className="w-5 h-5" />
    Danger Zone
  </h3>
  <p className="text-sm text-gray-600 mb-3">
    Permanently delete your account and all associated data.
  </p>
  <button
    onClick={async () => {
      if (!auth.currentUser) return;
      const confirmDelete = window.confirm("Are you sure?");
      if (!confirmDelete) return;
      try {
        await deleteDoc(doc(db, "users", auth.currentUser.uid));
        await deleteUser(auth.currentUser);
        alert("Deleted!");
        navigate("/auth");
      } catch (e) {
        alert("Failed to delete account");
      }
    }}
    className="w-full text-red-600 border border-red-300 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
  >
    Delete Account
  </button>
</SectionCard>*/}
    
      {isEditing && (
  <div className="flex gap-3 mt-4">
    <button
      onClick={handleSaveProfile}
      className="flex-1 bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded-l transition-colors flex items-center justify-center gap-2 text-sm font-medium"
    >
      <Save className="w-4 h-4" />
      Save All Changes
    </button>
    <button
      onClick={() => {
        setIsEditing(false);
        setEditName(userData.name || "");
        setEditCollege(userData.college || "");
        setBio(userData.bio || "");
        setGraduationYear(userData.graduationYear || "");
        setDepartment(userData.department || "");
        setSection(userData.section || "");
        setGithub(userData.github || "");
        setHackerRank(userData.hackerRank || "");
        setLinkedIn(userData.linkedIn || "");
        setResumeDrive(userData.resumeDrive || "");
        setExperiences(userData.experiences || []);
        setClubs(userData.clubs || []);
        setSkills(userData.skills || []);
      }}
      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-l transition-colors flex items-center justify-center gap-2 text-sm font-medium"
    >
      Cancel
    </button>
  </div>
)}

    



          </div>
        </div>
      </div>

      {/* Avatar Picker */}
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
