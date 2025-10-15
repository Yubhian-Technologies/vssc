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
  skills?: string[];
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
          setSkills(data.skills || []);
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
        skills,
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
  <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-4">
    {/* Left side: Avatar + Info */}
    <div className="flex items-center gap-4 w-full sm:w-auto">
      {/* Avatar */}
      <div className="relative">
        {userData.profileUrl ? (
          <img
            src={userData.profileUrl}
            alt="Profile"
            className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-white object-cover shadow-lg bg-white"
          />
        ) : (
          <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gray-100 border-4 border-white flex items-center justify-center shadow-lg">
            <User className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
          </div>
        )}
        <button
          onClick={() => setShowAvatarPicker(true)}
          className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-1 rounded-full shadow-lg transition-colors"
          title="Change profile picture"
        >
          <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
      </div>

      {/* Info */}
      <div className="flex flex-col justify-center">
        <h1 className="text-lg sm:text-2xl font-bold text-white">
          {userData.name || "Student"}
        </h1>
        <p className="text-blue-100 text-sm truncate">{userData.email}</p>
        {userData.college && (
          <p className="text-blue-100 text-sm truncate">{userData.college}</p>
        )}
      </div>
    </div>

    {/* Right side: Sign Out */}
    <div className="flex-shrink-0">
      <button
        onClick={handleSignOut}
        className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all backdrop-blur-sm border border-white border-opacity-30"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    </div>
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
    <div className="space-y-4">
      {accounts.map((account, index) => (
        <div
          key={index}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center border border-gray-200 rounded-lg p-4 shadow-sm bg-white"
        >
          {/* Platform Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Platform
            </label>
            <input
              type="text"
              value={account.platform}
              onChange={(e) => {
                const newAccounts = [...accounts];
                newAccounts[index].platform = e.target.value;
                setAccounts(newAccounts);
              }}
              placeholder="e.g. GitHub, LinkedIn, Portfolio"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* Account Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link
            </label>
            <input
              type="url"
              value={account.url}
              onChange={(e) => {
                const newAccounts = [...accounts];
                newAccounts[index].url = e.target.value;
                setAccounts(newAccounts);
              }}
              placeholder="https://example.com/profile"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* Delete Button Centered */}
          <div className="sm:col-span-2 flex justify-center mt-3">
            <button
              onClick={() => {
                const updated = accounts.filter((_, i) => i !== index);
                setAccounts(updated);
              }}
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-1.5 px-5 rounded-lg shadow transition duration-200"
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      {/* Add Account Button Centered */}
      <div className="flex justify-center mt-6">
        <button
          onClick={() => setAccounts([...accounts, { platform: "", url: "" }])}
          className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-6 rounded-lg shadow transition duration-200"
        >
          Add Account
        </button>
      </div>
    </div>
  ) : (
    <div className="space-y-3">
      {accounts.map((account, index) => (
        <a
          key={index}
          href={account.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex justify-between items-center bg-gray-100 hover:bg-gray-200 transition-colors px-4 py-3 rounded-lg shadow-sm font-medium break-words"
        >
          <span>{account.platform}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      ))}
    </div>
  )}
</SectionCard>


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
          className="flex items-center gap-2 border border-gray-200 rounded-lg p-2 shadow-sm bg-white"
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
            className="flex-1 border border-gray-300 rounded px-3 py-1.5 focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => {
              const newSkills = skills.filter((_, i) => i !== idx);
              setSkills(newSkills);
            }}
            className="bg-red-500 hover:bg-red-600 text-white font-medium px-3 py-1 rounded transition duration-200"
          >
            Delete
          </button>
        </div>
      ))}

      {/* Add Skill Button Centered */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => setSkills([...skills, ""])}
          className="bg-green-500 hover:bg-green-600 text-white font-medium px-5 py-2 rounded-lg shadow transition duration-200"
        >
          Add Skill
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
        className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white"
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
                className="flex-1 border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={exp.duration || ""}
                onChange={(e) =>
                  handleUpdateExperience(idx, "duration", e.target.value)
                }
                placeholder="Duration"
                className="w-36 border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
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
                className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-1.5 rounded-lg shadow transition duration-200"
              >
                Delete
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
          className="bg-green-500 hover:bg-green-600 text-white font-medium px-5 py-2 rounded-lg shadow transition duration-200"
        >
          Add Experience
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
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center border border-gray-200 rounded-lg p-4 shadow-sm bg-white"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Club Name
            </label>
            <input
              type="text"
              value={club.name}
              onChange={(e) => handleUpdateClub(idx, "name", e.target.value)}
              placeholder="Club Name"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
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
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="sm:col-span-2 flex justify-center mt-2">
            <button
              onClick={() => handleDeleteClub(idx)}
              className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-1.5 rounded-lg shadow transition duration-200"
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      <div className="flex justify-center mt-4">
        <button
          onClick={handleAddClub}
          className="bg-green-500 hover:bg-green-600 text-white font-medium px-5 py-2 rounded-lg shadow transition duration-200"
        >
          Add Club
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

          
            {/* Danger Zone Section */}
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
</SectionCard>
    
      {isEditing && (
  <div className="flex gap-3 mt-4">
    <button
      onClick={handleSaveProfile}
      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
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
      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
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
