import { useEffect, useState } from "react";
import TitleHeroSection from "@/components/TitleHeroSection";
import SearchFilter from "@/components/SearchFilter";
import { db } from "../firebase";
import green4 from "@/assets/green4.png";
import { motion } from "framer-motion";
import {
  collection,
  doc,
  updateDoc,
  arrayUnion,
  increment,
  addDoc,
  onSnapshot,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { useAuth } from "../AuthContext";
import { Users, Clock, BookOpen, User as UserIcon } from "lucide-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { runTransaction } from "firebase/firestore";

interface AcademicAdvisingSession {
  id: string;
  title: string;
  skills: string[];
  description: string;
  tutorName: string;
  colleges: string[];
  isGroup: boolean;
  slots: number;
  slotAvailable?: number;
  totalDuration?: number;
  slotDuration?: number;
  createdBy?: string;
  date?: string; // YYYY-MM-DD
  startTime?: string; // "10:00 PM"
  participants?: string[];
  bookedSlots?: {
    time: string;
    booked: boolean;
    user?: string | null;
  }[];
  expiryDate?: string; // YYYY-MM-DD
  expiryTime?: string; // "23:59"
}

interface UserData {
  id: string;
  name?: string;
  email?: string;
  college?: string;
}

export default function AcademicAdvisingPage() {
  const [sessions, setSessions] = useState<AcademicAdvisingSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<AcademicAdvisingSession[]>([]);
  const { user, userData } = useAuth();
  const userCollege = userData?.college;

  const [selectedSession, setSelectedSession] = useState<AcademicAdvisingSession | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AcademicAdvisingSession["bookedSlots"]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const collegesList = [
    { name: "Vishnu Institute of Technology", domain: "@vishnu.edu.in" },
    { name: "Vishnu Dental College", domain: "@vdc.edu.in" },
    { name: "Shri Vishnu College of Pharmacy", domain: "@svcp.edu.in" },
    { name: "BV Raju Institute of Technology", domain: "@bvrit.ac.in" },
    { name: "BVRIT Hyderabad College of Engineering", domain: "@bvrithyderabad.ac.in" },
    { name: "Shri Vishnu Engineering College for Women", domain: "@svecw.edu.in" },
  ];
  // admin states
  const [showForm, setShowForm] = useState(false);
  const [newSession, setNewSession] = useState({
    title: "",
    isGroup: undefined as boolean | undefined,
    date: "",
    startTime: "",
    totalDuration: 0,
    slotDuration: 0,
    slots: 1,
    colleges: [] as string[],
    description: "",
    tutorName: "",
    skills: [] as string[],
    expiryDate: "", // YYYY-MM-DD
    expiryTime: "", // "23:59"
  });
  const [showParticipants, setShowParticipants] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<UserData[]>([]);

  // --- Helper to check if session is expired ---
  const isSessionExpired = (session: AcademicAdvisingSession) => {
    if (!session.expiryDate || !session.expiryTime) return false;
    const [year, month, day] = session.expiryDate.split("-").map(Number);
    const [hours, minutes] = session.expiryTime.split(":").map(Number);
    const expiryDateTime = new Date(year, month - 1, day, hours, minutes);
    return new Date() > expiryDateTime;
  };

  // --- Fetch sessions in real-time ---
  useEffect(() => {
    if (!userCollege || !user) return;

    const q = collection(db, "academicadvising");

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const allSessions: AcademicAdvisingSession[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as AcademicAdvisingSession),
      }));

      let filtered: AcademicAdvisingSession[];
      if (userData?.role === "admin") {
        // Admin: show all sessions created by this admin, including expired ones
        filtered = allSessions.filter((session) => session.createdBy === user.uid);
      } else {
        // Normal user: show only sessions for their college that are not expired
        filtered = allSessions.filter(
          (session) => session.colleges.includes(userCollege) && !isSessionExpired(session)
        );
      }

      const updatedSessions = await Promise.all(
        filtered.map(async (session) => {
          if (!session.isGroup && session.slotDuration && session.totalDuration && session.date) {
            const slotCount = Math.floor(session.totalDuration / session.slotDuration);

            if (!Array.isArray(session.bookedSlots)) {
              const generatedSlots = Array.from({ length: slotCount }, (_, i) => {
                const [hoursStr, minutesStrWithSuffix] = session.startTime!.split(":");
                let hours = parseInt(hoursStr);
                let minutesStr = minutesStrWithSuffix;
                let suffix = "";
                if (minutesStrWithSuffix.includes("AM") || minutesStrWithSuffix.includes("PM")) {
                  suffix = minutesStrWithSuffix.slice(-2);
                  minutesStr = minutesStrWithSuffix.slice(0, -2).trim();
                }
                const minutes = parseInt(minutesStr);
                if (suffix.toLowerCase() === "pm" && hours < 12) hours += 12;

                const slotDate = new Date(session.date!);
                slotDate.setHours(hours, minutes + i * session.slotDuration, 0, 0);

                const timeStr = `${slotDate.getHours().toString().padStart(2, "0")}:${slotDate
                  .getMinutes()
                  .toString()
                  .padStart(2, "0")}`;

                return { time: timeStr, booked: false, user: null };
              });

              const sessionRef = doc(db, "academicadvising", session.id);
              await updateDoc(sessionRef, {
                bookedSlots: generatedSlots,
                slotAvailable: generatedSlots.length,
              });

              return { ...session, bookedSlots: generatedSlots, slotAvailable: generatedSlots.length };
            }

            const slotAvailable = session.bookedSlots.filter((s) => !s.booked).length;
            return { ...session, slotAvailable };
          }

          return session;
        })
      );

      setSessions(updatedSessions);
      setFilteredSessions(updatedSessions);
    });

    return () => unsubscribe();
  }, [userCollege, user, userData]);

  // --- Helpers ---
  const parseDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const normalizeDate = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const tileClassName = ({ date }: any) => {
    if (!selectedSession || !selectedSession.date) return "";
    const sessionDate = normalizeDate(parseDate(selectedSession.date));
    const currentDate = normalizeDate(date);
    const hasAvailableSlot = selectedSession.bookedSlots?.some((s) => !s.booked);
    return sessionDate.getTime() === currentDate.getTime() && hasAvailableSlot
      ? "bg-green-300 rounded-full"
      : "";
  };

  const handleDateClick = (date: Date) => {
    if (!selectedSession || !selectedSession.date) return;
    const sessionDate = normalizeDate(parseDate(selectedSession.date));
    const clickedDate = normalizeDate(date);
    if (clickedDate.getTime() === sessionDate.getTime()) {
      setSelectedDate(date);
      setAvailableSlots(selectedSession.bookedSlots || []);
    } else {
      setSelectedDate(null);
      setAvailableSlots([]);
    }
  };

  const handleBookSlot = (session: AcademicAdvisingSession) => {
    setSelectedSession(session);
    if (session.isGroup) {
      setShowDialog(true);
    } else {
      setShowCalendar(true);
      setSelectedDate(null);
      setSelectedSlot(null);
      setAvailableSlots([]);
    }
  };

  const handleSlotSelect = (slotTime: string) => {
    setSelectedSlot(slotTime);
    setShowDialog(true);
  };

  const confirmJoin = async () => {
    if (bookingInProgress) return;
    if (!user?.uid || !selectedSession || (!selectedSession.isGroup && !selectedSlot)) return;

    setBookingInProgress(true);
    const sessionRef = doc(db, "academicadvising", selectedSession.id);

    try {
      if (selectedSession.isGroup) {
        if (!selectedSession.slots || selectedSession.slots <= 0) {
          alert("No slots left.");
          return;
        }
        if (selectedSession.participants?.includes(user.uid)) {
          alert("You already joined this group session.");
          return;
        }
        await updateDoc(sessionRef, {
          participants: arrayUnion(user.uid),
          slots: increment(-1),
        });
        setSessions((prev) =>
          prev.map((s) =>
            s.id === selectedSession.id
              ? { ...s, participants: [...(s.participants || []), user.uid], slots: (s.slots || 1) - 1 }
              : s
          )
        );
        setFilteredSessions((prev) =>
          prev.map((s) =>
            s.id === selectedSession.id
              ? { ...s, participants: [...(s.participants || []), user.uid], slots: (s.slots || 1) - 1 }
              : s
          )
        );
        alert("You joined the group session!");
      } else {
        await runTransaction(db, async (transaction) => {
          const sessionSnap = await transaction.get(sessionRef);
          if (!sessionSnap.exists()) throw new Error("Session not found");

          const sessionData = sessionSnap.data() as AcademicAdvisingSession;
          if (!sessionData.bookedSlots) throw new Error("Slots not initialized");

          const alreadyBooked = sessionData.bookedSlots.some((s) => s.user === user.uid);
          if (alreadyBooked) {
            throw new Error("You already booked a slot in this session.");
          }

          const slotIndex = sessionData.bookedSlots.findIndex((s) => s.time === selectedSlot);
          if (slotIndex < 0) throw new Error("Slot not found");

          const slot = sessionData.bookedSlots[slotIndex];
          if (slot.booked) {
            throw new Error("Slot already booked by someone else.");
          }

          const updatedSlots = [...sessionData.bookedSlots];
          updatedSlots[slotIndex] = { ...updatedSlots[slotIndex], booked: true, user: user.uid };

          const updatedParticipants = sessionData.participants
            ? [...sessionData.participants, user.uid]
            : [user.uid];

          transaction.update(sessionRef, {
            bookedSlots: updatedSlots,
            slotAvailable: updatedSlots.filter((s) => !s.booked).length,
            participants: updatedParticipants,
          });
        });

        setSessions((prev) =>
          prev.map((s) =>
            s.id === selectedSession.id
              ? {
                  ...s,
                  bookedSlots: s.bookedSlots?.map((slot) =>
                    slot.time === selectedSlot ? { ...slot, booked: true, user: user.uid } : slot
                  ),
                  slotAvailable: s.bookedSlots?.filter((slot) => !slot.booked).length,
                  participants: [...(s.participants || []), user.uid],
                }
              : s
          )
        );
        setFilteredSessions((prev) =>
          prev.map((s) =>
            s.id === selectedSession.id
              ? {
                  ...s,
                  bookedSlots: s.bookedSlots?.map((slot) =>
                    slot.time === selectedSlot ? { ...slot, booked: true, user: user.uid } : slot
                  ),
                  slotAvailable: s.bookedSlots?.filter((slot) => !slot.booked).length,
                  participants: [...(s.participants || []), user.uid],
                }
              : s
          )
        );
        alert(`You booked the slot at ${selectedSlot}`);
      }
    } catch (err: any) {
      alert(err.message || "Booking failed. Try again.");
    } finally {
      setBookingInProgress(false);
      setShowDialog(false);
      setShowCalendar(false);
      setSelectedSession(null);
      setSelectedSlot(null);
      setSelectedDate(null);
      setAvailableSlots([]);
    }
  };

  // --- Admin Features ---
  const handleAddSession = async () => {
    if (
      !newSession.title ||
      !newSession.description ||
      !newSession.tutorName ||
      !newSession.skills.length ||
      !newSession.date ||
      newSession.isGroup === undefined ||
      (!newSession.isGroup && (!newSession.startTime || !newSession.totalDuration || !newSession.slotDuration)) ||
      (newSession.isGroup && !newSession.startTime) ||
      !newSession.expiryDate ||
      !newSession.expiryTime
    ) {
      alert("Please fill in all required fields (title, description, tutor name, skills, date, session type, expiry date, and expiry time). For 1-on-1, include start time, total duration, and slot duration. For group, include start time.");
      return;
    }

    try {
      const sessionData: any = {
        title: newSession.title,
        createdBy: user?.uid,
        colleges: newSession.colleges || [],
        description: newSession.description,
        tutorName: newSession.tutorName,
        skills: newSession.skills,
        createdAt: serverTimestamp(),
        isGroup: newSession.isGroup,
        expiryDate: newSession.expiryDate,
        expiryTime: newSession.expiryTime,
      };

      if (newSession.isGroup) {
        sessionData.slots = newSession.slots || 1;
        sessionData.participants = [];
        sessionData.date = newSession.date;
        sessionData.startTime = newSession.startTime;
      } else {
        sessionData.date = newSession.date;
        sessionData.startTime = newSession.startTime;
        sessionData.totalDuration = newSession.totalDuration;
        sessionData.slotDuration = newSession.slotDuration;
        sessionData.slotAvailable = Math.floor(newSession.totalDuration / newSession.slotDuration);
        sessionData.participants = [];

        const [hoursStr, minutesStrWithSuffix] = newSession.startTime!.split(":");
        let hours = parseInt(hoursStr);
        let minutesStr = minutesStrWithSuffix;
        let suffix = "";
        if (minutesStrWithSuffix.includes("AM") || minutesStrWithSuffix.includes("PM")) {
          suffix = minutesStrWithSuffix.slice(-2);
          minutesStr = minutesStrWithSuffix.slice(0, -2).trim();
        }
        const minutes = parseInt(minutesStr);
        if (suffix.toLowerCase() === "pm" && hours < 12) hours += 12;

        const slotCount = Math.floor(newSession.totalDuration / newSession.slotDuration);
        const bookedSlots = Array.from({ length: slotCount }, (_, i) => {
          const slotDate = new Date(newSession.date!);
          slotDate.setHours(hours, minutes + i * newSession.slotDuration, 0, 0);
          const timeStr = `${slotDate.getHours().toString().padStart(2, "0")}:${slotDate
            .getMinutes()
            .toString()
            .padStart(2, "0")}`;
          return { time: timeStr, booked: false, user: null };
        });

        sessionData.bookedSlots = bookedSlots;
      }

      await addDoc(collection(db, "academicadvising"), sessionData);

      setShowForm(false);
      setNewSession({
        title: "",
        isGroup: undefined,
        date: "",
        startTime: "",
        totalDuration: 0,
        slotDuration: 0,
        slots: 1,
        colleges: [],
        description: "",
        tutorName: "",
        skills: [],
        expiryDate: "",
        expiryTime: "",
      });
    } catch (err) {
      console.error("Error adding session:", err);
      alert("Failed to add session. Try again.");
    }
  };

  const handleViewParticipants = async (participants: string[] = []) => {
    if (!participants || participants.length === 0) {
      alert("No participants booked yet.");
      return;
    }

    const participantsData: UserData[] = [];

    for (const uid of participants) {
      try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          participantsData.push({ id: uid, ...(userDoc.data() as UserData) });
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    }

    setSelectedParticipants(participantsData);
    setShowParticipants(true);
  };

  return (

    <div>

      <div className="relative w-full h-72 md:h-96 lg:h-[28rem]">
        <img
          src={green4}
          alt="About Banner"
          className="w-full h-full object-contain object-top"
        />
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-4">
          <motion.h1
            className="text-3xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Available Academic Advising Sessions
          </motion.h1>
          <p className="max-w-2xl text-lg">
            Book a session with your advisor to get guidance and support
          </p>
        </div>
      </div>
      <div className="p-6 min-h-screen [background-color:hsl(60,100%,95%)]">
        {/* <TitleHeroSection
          title="Available Academic Advising Sessions"
          subtitle="Book a session with your advisor to get guidance and support"
        /> */}

        <SearchFilter data={sessions} onFilteredData={setFilteredSessions} />

        {filteredSessions.length === 0 ? (
          <p className="text-center text-gray-600">No sessions available for your college.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className="group relative [background-color:hsl(60,100%,90%)] border border-gray-200 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden p-6"
              >
                <div className="absolute top-0 right-0 px-3 py-1 text-xs font-semibold bg-primary text-white rounded-bl-lg">
                  {session.isGroup ? "Group" : "1-on-1"}
                  {userData?.role === "admin" && isSessionExpired(session) && (
                    <span className="ml-2 bg-red-600 px-2 rounded">Expired</span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-gray-800 group-hover:text-primary transition">
                  {session.title}
                </h2>
                <p className="text-gray-600 mt-2 flex-1">{session.description}</p>
                <div className="mt-4 space-y-2 text-sm text-gray-700">
                  <p className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-primary" />
                    <span>
                      <strong>Tutor:</strong> {session.tutorName}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-green-600" />
                    <span>
                      <strong>Skills:</strong> {session.skills.join(", ")}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>
                      <strong>Start:</strong> {session.date} {session.startTime}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-red-600" />
                    <span>
                      <strong>Expiry:</strong> {session.expiryDate} {session.expiryTime}
                    </span>
                  </p>
                  {session.isGroup ? (
                    <p className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-pink-600" />
                      <span>
                        <strong>Slots Left:</strong> {session.slots}
                      </span>
                    </p>
                  ) : (
                    <p className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-600" />
                      <span>
                        <strong>One-to-One Slots:</strong> {session.slotAvailable}
                      </span>
                    </p>
                  )}
                </div>
                <button
                  className={`mt-5 w-full py-2 rounded-lg font-semibold text-white transition 
                  ${
                    userData?.role === "admin" || isSessionExpired(session)
                      ? "bg-gray-400 cursor-not-allowed"
                      : session.isGroup
                      ? session.slots && session.slots > 0
                        ? "bg-gradient-to-r from-primary to-indigo-800 hover:from-indigo-800 hover:to-blue-600"
                        : "bg-gray-400 cursor-not-allowed"
                      : session.slotAvailable && session.slotAvailable > 0
                      ? "bg-gradient-to-r from-primary to-indigo-800 hover:from-indigo-800 hover:to-blue-600"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                  onClick={() => handleBookSlot(session)}
                  disabled={
                    userData?.role === "admin" ||
                    isSessionExpired(session) ||
                    (session.isGroup && (!session.slots || session.slots <= 0)) ||
                    (!session.isGroup && (!session.slotAvailable || session.slotAvailable <= 0))
                  }
                >
                  {session.isGroup
                    ? session.slots && session.slots > 0
                      ? "Enroll Now"
                      : "Full"
                    : session.slotAvailable && session.slotAvailable > 0
                    ? "Book a Slot"
                    : "Full"}
                </button>

                {user?.uid === session.createdBy && (
                  <div className="flex justify-end mt-2">
                    <p
                      className="text-blue-600 hover:underline cursor-pointer text-sm"
                      onClick={() => handleViewParticipants(session.participants || [])}
                    >
                      View Participants
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {/* Floating Add Session Button */}
        {userData?.role === "admin" && (
          <button
            onClick={() => setShowForm(true)}
            className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center text-3xl shadow-lg hover:bg-blue-700"
          >
            +
          </button>
        )}

        {/* Add Session Modal */}
        {showForm && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 overflow-y-auto backdrop-blur-sm">
    <div className="bg-[hsl(60,100%,95%)] rounded-2xl p-8 w-full max-w-lg space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
      {/* Header */}
      <div className="text-center border-b border-gray-100 pb-4">
        <h2 className="text-2xl text-primary font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text ">
          Add New Academic Advising Session
        </h2>
        <p className="text-gray-500 text-sm mt-1">Fill in the details to create a new advising session</p>
      </div>

      {/* Form Container */}
      <form className="space-y-6">
        {/* Session Title */}
        <div className="space-y-2">
          <label htmlFor="title" className="flex items-center gap-2 font-semibold text-gray-700">
            
            Title
          </label>
          <input
            type="text"
            name="title"
            id="title"
            placeholder="Enter session title"
            className="w-full p-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
            value={newSession.title || ""}
            onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label htmlFor="description" className="flex items-center gap-2 font-semibold text-gray-700">
            
            Description
          </label>
          <textarea
            name="description"
            id="description"
            placeholder="Enter session description"
            rows={2}
            className="w-full p-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none bg-gray-50 hover:bg-white"
            value={newSession.description || ""}
            onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
          />
        </div>

        {/* Tutor Name */}
        <div className="space-y-2">
          <label htmlFor="tutorName" className="flex items-center gap-2 font-semibold text-gray-700">
            
            Tutor Name
          </label>
          <input
            type="text"
            name="tutorName"
            id="tutorName"
            placeholder="Enter tutor name"
            className="w-full p-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
            value={newSession.tutorName || ""}
            onChange={(e) => setNewSession({ ...newSession, tutorName: e.target.value })}
          />
        </div>

        {/* Skills */}
        <div className="space-y-2">
          <label htmlFor="skills" className="flex items-center gap-2 font-semibold text-gray-700">
            
            Skills
          </label>
          <input
            type="text"
            name="skills"
            id="skills"
            placeholder="Enter skills separated by commas"
            className="w-full p-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
            value={newSession.skills?.join(", ") || ""}
            onChange={(e) =>
              setNewSession({
                ...newSession,
                skills: e.target.value.split(",").map((s) => s.trim()).filter((s) => s),
              })
            }
          />
          <p className="text-xs text-gray-500 flex items-center gap-1">
            
            Separate multiple skills with commas
          </p>
        </div>

        {/* Colleges Multi-Select Dropdown */}
        <div className="space-y-3">
          <label htmlFor="colleges" className="flex items-center gap-2 font-semibold text-gray-700">
            
            Colleges
          </label>
          <select
            name="colleges"
            id="colleges"
            className="w-full p-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white h-40"
            multiple
            value={newSession.colleges && newSession.colleges.length > 0 ? newSession.colleges : []}
            onChange={(e) =>
              setNewSession({
                ...newSession,
                colleges: Array.from(e.target.selectedOptions, (option) => option.value),
              })
            }
          >
            <option value="" disabled hidden>
              Select College(s)
            </option>
            <option value="Vishnu Institute of Technology">Vishnu Institute of Technology</option>
            <option value="Vishnu Dental College">Vishnu Dental College</option>
            <option value="Shri Vishnu College of Pharmacy">Shri Vishnu College of Pharmacy</option>
            <option value="BV Raju Institute of Technology">BV Raju Institute of Technology</option>
            <option value="BVRIT Hyderabad College of Engineering">
              BVRIT Hyderabad College of Engineering
            </option>
            <option value="Shri Vishnu Engineering College for Women">
              Shri Vishnu Engineering College for Women
            </option>
          </select>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            
            Hold Ctrl (Cmd on Mac) to select multiple colleges
          </p>
        </div>

        {/* Session Type */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 font-semibold text-gray-700">
            
            Session Type
          </label>
          <div className="flex items-center gap-6 bg-[hsl(60,100%,95%)] border-2 p-2 rounded-xl">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="isGroup"
                className="w-4 h-4 text-primary focus:ring-primary"
                checked={newSession.isGroup === true}
                onChange={() => setNewSession({ ...newSession, isGroup: true })}
              />
              <span className="font-medium text-gray-700">Group</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="isGroup"
                className="w-4 h-4 text-primary focus:ring-primary"
                checked={newSession.isGroup === false}
                onChange={() => setNewSession({ ...newSession, isGroup: false })}
              />
              <span className="font-medium text-gray-700">1-on-1</span>
            </label>
          </div>
        </div>

        {/* Group Session Fields */}
        {newSession.isGroup && (
          <div className="space-y-4 p-2 bg-blue-50 rounded-xl border border-blue-100">
            <h3 className="font-semibold text-blue-800 flex items-center gap-2">
              
              Group Session Details
            </h3>
            
            <div className="grid grid-cols-1 gap-2">
              <div className="space-y-2">
                <label htmlFor="date" className="font-semibold text-gray-700 text-sm">Date</label>
                <input
                  type="date"
                  name="date"
                  id="date"
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-white"
                  value={newSession.date || ""}
                  onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="startTime" className="font-semibold text-gray-700 text-sm">Start Time</label>
                <input
                  type="time"
                  name="startTime"
                  id="startTime"
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-white"
                  value={newSession.startTime || ""}
                  onChange={(e) => setNewSession({ ...newSession, startTime: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="slots" className="font-semibold text-gray-700 text-sm">Number of Slots</label>
                <input
                  type="number"
                  name="slots"
                  id="slots"
                  placeholder="Enter number of slots"
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-white"
                  value={newSession.slots || ""}
                  onChange={(e) => setNewSession({ ...newSession, slots: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </div>
        )}

        {/* 1-on-1 Fields */}
        {newSession.isGroup === false && (
          <div className="space-y-4 p-2 bg-green-50 rounded-xl border border-green-100">
            <h3 className="font-semibold text-green-800 flex items-center gap-2">
              
              1-on-1 Session Details
            </h3>
            
            <div className="grid grid-cols-1 gap-2">
              <div className="space-y-2">
                <label htmlFor="date" className="font-semibold text-gray-700 text-sm">Date</label>
                <input
                  type="date"
                  name="date"
                  id="date"
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-white"
                  value={newSession.date || ""}
                  onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="startTime" className="font-semibold text-gray-700 text-sm">Start Time</label>
                <input
                  type="time"
                  name="startTime"
                  id="startTime"
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-white"
                  value={newSession.startTime || ""}
                  onChange={(e) => setNewSession({ ...newSession, startTime: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="totalDuration" className="font-semibold text-gray-700 text-sm">Total Duration (minutes)</label>
                <input
                  type="number"
                  name="totalDuration"
                  id="totalDuration"
                  placeholder="Enter total duration"
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-white"
                  value={newSession.totalDuration || ""}
                  onChange={(e) =>
                    setNewSession({ ...newSession, totalDuration: parseInt(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="slotDuration" className="font-semibold text-gray-700 text-sm">Slot Duration (minutes)</label>
                <input
                  type="number"
                  name="slotDuration"
                  id="slotDuration"
                  placeholder="Enter slot duration"
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-white"
                  value={newSession.slotDuration || ""}
                  onChange={(e) =>
                    setNewSession({ ...newSession, slotDuration: parseInt(e.target.value) })
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* Expiry Fields */}
        <div className="grid grid-cols-1 gap-2">
          <div className="space-y-2">
            <label htmlFor="expiryDate" className="flex items-center gap-2 font-semibold text-gray-700">
             
              Expiry Date
            </label>
            <input
              type="date"
              name="expiryDate"
              id="expiryDate"
              className="w-full p-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              value={newSession.expiryDate || ""}
              onChange={(e) => setNewSession({ ...newSession, expiryDate: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="expiryTime" className="flex items-center gap-2 font-semibold text-gray-700">
              
              Expiry Time
            </label>
            <input
              type="time"
              name="expiryTime"
              id="expiryTime"
              className="w-full p-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              value={newSession.expiryTime || ""}
              onChange={(e) => setNewSession({ ...newSession, expiryTime: e.target.value })}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            className="px-6 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-800 transition-all duration-200 flex items-center gap-2 shadow-sm"
            onClick={() => setShowForm(false)}
          >
            
            Cancel
          </button>
          <button
            type="button"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white font-medium  transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            onClick={handleAddSession}
          >
            
            Add Session
          </button>
        </div>
      </form>
    </div>
  </div>
)}

        {/* Participants Modal */}
        {showParticipants && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-[hsl(60,100%,95%)] p-6 rounded-lg shadow-lg w-[450px]">
              <h3 className="text-lg font-bold mb-4">Participants</h3>
              {selectedParticipants.length === 0 ? (
                <p className="text-sm text-gray-500">No participants yet</p>
              ) : (
                <ul className="list-disc pl-5 space-y-2">
                  {selectedParticipants.map((user) => (
                    <li key={user.id}>
                      <span className="font-medium">{user.name || "N/A"}</span> -{" "}
                      {user.email || "No email"} ({user.college || "No college"})
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowParticipants(false)}
                  className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Calendar Modal */}
        {showCalendar && selectedSession && !selectedSession.isGroup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="[background-color:hsl(60,100%,90%)] rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">{selectedSession.title} - Select Date</h2>
              <Calendar className="[background-color:hsl(60,100%,90%)]" onClickDay={handleDateClick} tileClassName={tileClassName} />

              {selectedDate && availableSlots.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 font-semibold">
                    Available Slots on {selectedDate.toDateString()}:
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {availableSlots.map((slot) => {
                      const isUserSlot = slot.user === user?.uid;

                      return (
                        <button
                          key={slot.time}
                          className={`py-2 rounded-lg text-sm font-semibold text-white transition
                            ${slot.booked ? (isUserSlot ? "bg-green-600" : "bg-gray-400") : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-600 hover:to-blue-600"}`}
                          onClick={() => handleSlotSelect(slot.time)}
                          disabled={slot.booked}
                        >
                          {slot.time} {slot.booked ? (isUserSlot ? "(Your Booking)" : "(Booked)") : ""}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-center items-center">
                <button
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-800 text-white justify-center items-center"
                  onClick={() => setShowCalendar(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Dialog */}
        {showDialog && selectedSession && (selectedSession.isGroup || selectedSlot) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="[background-color:hsl(60,100%,95%)] rounded-xl p-6 w-96">
              <h2 className="text-xl font-bold mb-4">Confirm Booking</h2>
              <p className="mb-4">
                Are you sure you want to {selectedSession.isGroup ? "join" : "book"}{" "}
                <strong>{selectedSession.title}</strong>
                {!selectedSession.isGroup && selectedSlot ? ` at ${selectedSlot}` : ""}?
              </p>
              <div className="flex justify-end gap-4">
                <button
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-800 text-white"
                  onClick={() => setShowDialog(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-blue-800"
                  onClick={confirmJoin}
                  disabled={bookingInProgress}
                >
                  {bookingInProgress ? "Processing..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
