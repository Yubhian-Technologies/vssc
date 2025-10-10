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
  Plus,
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
          setGraduationYear(data.graduationYear || "");
          setDepartment(data.department || "");
          setSection(data.section || "");
          setGithub(data.github || "");
          setHackerRank(data.hackerRank || "");
          setLinkedIn(data.linkedIn || "");
          setResumeDrive(data.resumeDrive || "");
          setExperiences(data.experiences || []);
          setClubs(data.clubs || []);
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

  const handleAddExperience = () => {
    setExperiences([...experiences, { title: "", description: "" }]);
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
        className="relative h-56 sm:h-48 xs:h-40"
        style={{
          background:
            "linear-gradient(to right, hsl(220, 70%, 20%), hsl(220, 70%, 25%))",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 h-full flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="relative group">
              {userData.profileUrl ? (
                <img
                  src={userData.profileUrl}
                  alt="Profile"
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white object-cover shadow-lg bg-white"
                />
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-100 border-4 border-white flex items-center justify-center shadow-lg">
                  <User className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                </div>
              )}
              <button
                onClick={() => setShowAvatarPicker(true)}
                className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-blue-600 hover:bg-blue-700 text-white p-1 sm:p-2 rounded-full shadow-lg transition-colors"
                title="Change profile picture"
              >
                <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>

            <div className="text-left">
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                {userData.name || "Student"}
              </h1>
              <p className="text-blue-100 text-sm">{userData.email}</p>
              {userData.college && (
                <p className="text-blue-100 text-sm">{userData.college}</p>
              )}
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all backdrop-blur-sm border border-white border-opacity-30 mt-2 sm:mt-0"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 mt-6 sm:mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Info */}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 resize-none bg-white"
                      rows={3}
                    />
                  </div>

                  {/* Accounts */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        GitHub
                      </label>
                      <input
                        type="text"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="https://github.com/username"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        HackerRank
                      </label>
                      <input
                        type="text"
                        value={hackerRank}
                        onChange={(e) => setHackerRank(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="https://www.hackerrank.com/username"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        LinkedIn
                      </label>
                      <input
                        type="text"
                        value={linkedIn}
                        onChange={(e) => setLinkedIn(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="https://www.linkedin.com/in/username"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Resume Drive
                      </label>
                      <input
                        type="text"
                        value={resumeDrive}
                        onChange={(e) => setResumeDrive(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="Google Drive link"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-3">
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
                        setGraduationYear(userData.graduationYear || "");
                        setDepartment(userData.department || "");
                        setSection(userData.section || "");
                        setGithub(userData.github || "");
                        setHackerRank(userData.hackerRank || "");
                        setLinkedIn(userData.linkedIn || "");
                        setResumeDrive(userData.resumeDrive || "");
                        setExperiences(userData.experiences || []);
                        setClubs(userData.clubs || []);
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
                    <p className="text-gray-900">{userData.college || "Not set"}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                  {/* Accounts */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {github && (
                      <a
                        href={github}
                        target="_blank"
                        className="text-blue-600 text-sm hover:underline"
                      >
                        GitHub
                      </a>
                    )}
                    {hackerRank && (
                      <a
                        href={hackerRank}
                        target="_blank"
                        className="text-blue-600 text-sm hover:underline"
                      >
                        HackerRank
                      </a>
                    )}
                    {linkedIn && (
                      <a
                        href={linkedIn}
                        target="_blank"
                        className="text-blue-600 text-sm hover:underline"
                      >
                        LinkedIn
                      </a>
                    )}
                    {resumeDrive && (
                      <a
                        href={resumeDrive}
                        target="_blank"
                        className="text-blue-600 text-sm hover:underline"
                      >
                        Resume
                      </a>
                    )}
                  </div>
                </div>
              )}
            </SectionCard>

            {/* Experiences */}
            <SectionCard>
              <SectionTitle icon={Activity}>
                Experiences
                {isEditing && (
                  <button
                    onClick={handleAddExperience}
                    className="ml-2 text-green-600 hover:text-green-700"
                  >
                    <Plus className="w-4 h-4 inline-block" />
                  </button>
                )}
              </SectionTitle>

              {experiences.length === 0 && <p className="text-gray-600 text-sm">No experiences added yet.</p>}

              {experiences.map((exp, idx) => (
                <div key={idx} className="border rounded-lg p-2 bg-white mb-2">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={exp.title}
                        onChange={(e) => handleUpdateExperience(idx, "title", e.target.value)}
                        placeholder="Title"
                        className="w-full border border-gray-300 rounded px-2 py-1 mb-1 focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={exp.description}
                        onChange={(e) => handleUpdateExperience(idx, "description", e.target.value)}
                        placeholder="Description"
                        className="w-full border border-gray-300 rounded px-2 py-1 mb-1 focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={exp.duration || ""}
                        onChange={(e) => handleUpdateExperience(idx, "duration", e.target.value)}
                        placeholder="Duration"
                        className="w-full border border-gray-300 rounded px-2 py-1 mb-1 focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleDeleteExperience(idx)}
                        className="text-red-600 hover:text-red-700 text-sm mt-1"
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="font-medium">{exp.title}</p>
                      <p className="text-sm">{exp.description}</p>
                      {exp.duration && <p className="text-xs text-gray-500">{exp.duration}</p>}
                    </>
                  )}
                </div>
              ))}
            </SectionCard>

            {/* Clubs */}
            <SectionCard>
              <SectionTitle icon={User}>
                Clubs & Memberships
                {isEditing && (
                  <button
                    onClick={handleAddClub}
                    className="ml-2 text-green-600 hover:text-green-700"
                  >
                    <Plus className="w-4 h-4 inline-block" />
                  </button>
                )}
              </SectionTitle>

              {clubs.length === 0 && <p className="text-gray-600 text-sm">No clubs added yet.</p>}

              {clubs.map((club, idx) => (
                <div key={idx} className="border rounded-lg p-2 bg-white mb-2 flex flex-col sm:flex-row justify-between items-center gap-2">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={club.name}
                        onChange={(e) => handleUpdateClub(idx, "name", e.target.value)}
                        placeholder="Club Name"
                        className="w-full sm:w-auto border border-gray-300 rounded px-2 py-1 mb-1 sm:mb-0 focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={club.proofUrl || ""}
                        onChange={(e) => handleUpdateClub(idx, "proofUrl", e.target.value)}
                        placeholder="Proof URL"
                        className="w-full sm:w-auto border border-gray-300 rounded px-2 py-1 mb-1 sm:mb-0 focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleDeleteClub(idx)}
                        className="text-red-600 hover:text-red-700 text-sm mt-1 sm:mt-0"
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="font-medium">{club.name}</p>
                      {club.proofUrl && (
                        <a href={club.proofUrl} target="_blank" className="text-blue-600 text-sm hover:underline">
                          View Proof
                        </a>
                      )}
                    </>
                  )}
                </div>
              ))}
            </SectionCard>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
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
                onClick={() => alert("Feedback submitted!")}
                className="mt-3 w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Submit Feedback
              </button>
            </SectionCard>

            {/* Settings 
            <SectionCard>
              <SectionTitle icon={Settings}>Settings</SectionTitle>
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
            */}

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
            </SectionCard>
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
