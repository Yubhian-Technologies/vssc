import { useEffect, useState } from "react";
import { db } from "../firebase";
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
import { runTransaction} from "firebase/firestore";

interface TutoringSession {
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

}
interface UserData {
  id: string;
  name?: string;
  email?: string;
  college?: string;
}

export default function TutoringPage() {
  const [sessions, setSessions] = useState<TutoringSession[]>([]);
  const { user, userData } = useAuth();
  const userCollege = userData?.college;

  const [selectedSession, setSelectedSession] = useState<TutoringSession | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TutoringSession["bookedSlots"]>([]);
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
  isGroup: undefined as boolean | undefined, // whether it's a group session
  date: "",          // only for 1-on-1
  startTime: "",     // only for 1-on-1
  totalDuration: 0,  // only for 1-on-1
  slotDuration: 0,   // only for 1-on-1
  slots: 1,          // only for group sessions
  colleges: [] as string[],
  description: "",
  tutorName: "",
  skills: [] as string[],
});
  const [showParticipants, setShowParticipants] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<UserData[]>([]);

  

  // --- Fetch sessions in real-time ---
 useEffect(() => {
  if (!userCollege || !user) return;

  const q = collection(db, "tutoring");

  const unsubscribe = onSnapshot(q, async snapshot => {
    const allSessions: TutoringSession[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as TutoringSession),
    }));

    let filtered: TutoringSession[];
    if (userData?.role === "admin") {
      // Admin: only sessions created by this admin
      filtered = allSessions.filter(session => session.createdBy === user.uid);
    } else {
      // Normal user: sessions for their college
      filtered = allSessions.filter(session => session.colleges.includes(userCollege));
    }

    const updatedSessions = await Promise.all(
      filtered.map(async session => {
        if (!session.isGroup && session.slotDuration && session.totalDuration && session.date) {
          const slotCount = Math.floor(session.totalDuration / session.slotDuration);

          // If bookedSlots doesn't exist, generate and save
          if (!Array.isArray(session.bookedSlots)) {
            const generatedSlots = Array.from({ length: slotCount }, (_, i) => {
              const [hoursStr, minutesStrWithSuffix] = session.startTime!.split(":");
              let hours = parseInt(hoursStr);
              let minutesStr = minutesStrWithSuffix;
              let suffix = "";
              if (minutesStrWithSuffix.includes("AM") || minutesStrWithSuffix.includes("PM")) {
                suffix = minutesStrWithSuffix.slice(-2);
                minutesStr = minutesStr.slice(0, -2).trim();
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

            const sessionRef = doc(db, "tutoring", session.id);
            await updateDoc(sessionRef, {
              bookedSlots: generatedSlots,
              slotAvailable: generatedSlots.length,
            });

            return { ...session, bookedSlots: generatedSlots, slotAvailable: generatedSlots.length };
          }

          const slotAvailable = session.bookedSlots.filter(s => !s.booked).length;
          return { ...session, slotAvailable };
        }

        return session;
      })
    );

    setSessions(updatedSessions);
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
    return sessions.some(session => {
      if (!session.date) return false;
      const sessionDate = normalizeDate(parseDate(session.date));
      const currentDate = normalizeDate(date);
      const hasAvailableSlot = session.bookedSlots?.some(s => !s.booked);
      return sessionDate.getTime() === currentDate.getTime() && hasAvailableSlot;
    })
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

  const handleBookSlot = (session: TutoringSession) => {
    setSelectedSession(session);
     if (session.isGroup) {
    // Directly open confirm dialog for group sessions
    setShowDialog(true);
  } else {
    // 1-on-1 session: open calendar to select date/slot
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
  const sessionRef = doc(db, "tutoring", selectedSession.id);

  try {
    if (selectedSession.isGroup) {
      // Group session code...
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
        setSessions(prev =>
  prev.map(s =>
    s.id === selectedSession.id
      ? { ...s, participants: [...(s.participants || []), user.uid] } // DON'T decrement slots here
      : s
  )
        );
        alert("You joined the group session!");
    } else {
      await runTransaction(db, async (transaction) => {
        const sessionSnap = await transaction.get(sessionRef);
        if (!sessionSnap.exists()) throw new Error("Session not found");

        const sessionData = sessionSnap.data() as TutoringSession;
        if (!sessionData.bookedSlots) throw new Error("Slots not initialized");

        // Check if user already booked
        const alreadyBooked = sessionData.bookedSlots.some(s => s.user === user.uid);
        if (alreadyBooked) {
          throw new Error("You already booked a slot in this session.");
        }

        // Find the slot
        const slotIndex = sessionData.bookedSlots.findIndex(s => s.time === selectedSlot);
        if (slotIndex < 0) throw new Error("Slot not found");

        const slot = sessionData.bookedSlots[slotIndex];
        if (slot.booked) {
          throw new Error("Slot already booked by someone else.");
        }

        // Update slot
        const updatedSlots = [...sessionData.bookedSlots];
        updatedSlots[slotIndex] = { ...updatedSlots[slotIndex], booked: true, user: user.uid };

        // Add user to participants array
        const updatedParticipants = sessionData.participants
          ? [...sessionData.participants, user.uid]
          : [user.uid];

        transaction.update(sessionRef, {
          bookedSlots: updatedSlots,
          slotAvailable: updatedSlots.filter(s => !s.booked).length,
          participants: updatedParticipants,
        });
      });

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
  if (!newSession.title || !newSession.date || newSession.isGroup === undefined) {
    alert("Please fill in all required fields.");
    return;
  }

  try {
    const sessionData: any = {
      title: newSession.title,
      createdBy: user?.uid,
      colleges: newSession.colleges || [], // array of colleges
      description: newSession.description || "",
      tutorName: newSession.tutorName || "",
      skills: newSession.skills || [],
      createdAt: serverTimestamp(),
      isGroup: newSession.isGroup,
    };

    if (newSession.isGroup) {
      // Group session fields
      sessionData.slots = newSession.slots || 1;
      sessionData.participants = [];
    } else {
      // 1-on-1 session fields
      sessionData.date = newSession.date;
      sessionData.startTime = newSession.startTime;
      sessionData.totalDuration = newSession.totalDuration; // in minutes
      sessionData.slotDuration = newSession.slotDuration; // in minutes
      sessionData.slotAvailable = Math.floor(newSession.totalDuration / newSession.slotDuration);
      sessionData.participants = [];

      // Generate bookedSlots dynamically
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

    await addDoc(collection(db, "tutoring"), sessionData);

    setShowForm(false);
    setNewSession({
      title: "",
      date: "",
      isGroup: undefined,
      slots: 1,
      startTime: "",
      totalDuration: 0,
      slotDuration: 0,
      colleges: [],
      description: "",
      tutorName: "",
      skills: [],
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
    <div className="p-6 min-h-screen [background-color:hsl(60,100%,95%)]">
      <h1 className="text-3xl font-extrabold text-center mb-10 bg-gradient-to-r from-primary to-indigo-700 bg-clip-text text-transparent">
        Available Tutoring Sessions
      </h1>

      {sessions.length === 0 ? (
        <p className="text-center text-gray-600">No sessions available for your college.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {sessions.map(session => (
            <div
              key={session.id}
              className="group relative [background-color:hsl(60,100%,90%)] border border-gray-200 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden p-6"
            >
              <div className="absolute top-0 right-0 px-3 py-1 text-xs font-semibold bg-primary text-white rounded-bl-lg">
                {session.isGroup ? "Group" : "1-on-1"}
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
      userData?.role === "admin"
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
    (session.isGroup && (!session.slots || session.slots <= 0)) ||
    (!session.isGroup && (!session.slotAvailable || session.slotAvailable <= 0))
  }
>
  {session.isGroup
    ? session.slots && session.slots > 0
      ? "Join Session"
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
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center text-3xl shadow-lg hover:bg-blue-700"
      >
        +
      </button>
      
      {/* Add Session Modal */}
    {showForm && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 overflow-y-auto">
    <div className="bg-white rounded-xl p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
      <h2 className="text-xl font-bold">Add New Tutoring Session</h2>

      {/* Session Title */}
      <div className="flex flex-col">
        <label htmlFor="title" className="font-semibold mb-1">
          Title
        </label>
        <input
          type="text"
          name="title"
          id="title"
          placeholder="Enter session title"
          className="w-full p-2 border rounded-lg"
          value={newSession.title || ""}
          onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
        />
      </div>

      {/* Description */}
      <div className="flex flex-col">
        <label htmlFor="description" className="font-semibold mb-1">
          Description
        </label>
        <textarea
          name="description"
          id="description"
          placeholder="Enter session description"
          className="w-full p-2 border rounded-lg"
          value={newSession.description || ""}
          onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
        />
      </div>

      {/* Tutor Name */}
      <div className="flex flex-col">
        <label htmlFor="tutorName" className="font-semibold mb-1">
          Tutor Name
        </label>
        <input
          type="text"
          name="tutorName"
          id="tutorName"
          placeholder="Enter tutor name"
          className="w-full p-2 border rounded-lg"
          value={newSession.tutorName || ""}
          onChange={(e) => setNewSession({ ...newSession, tutorName: e.target.value })}
        />
      </div>

      {/* Skills */}
      <div className="flex flex-col">
        <label htmlFor="skills" className="font-semibold mb-1">
          Skills
        </label>
        <input
          type="text"
          name="skills"
          id="skills"
          placeholder="Enter skills separated by commas"
          className="w-full p-2 border rounded-lg"
          value={newSession.skills?.join(", ") || ""}
          onChange={(e) =>
            setNewSession({
              ...newSession,
              skills: e.target.value.split(",").map((s) => s.trim()),
            })
          }
        />
      </div>

      {/* Colleges Multi-Select Dropdown */}
      <div className="flex flex-col">
        <label htmlFor="colleges" className="font-semibold mb-1">
          Colleges
        </label>
        <select
          name="colleges"
          id="colleges"
          className="w-full p-2 border rounded-lg"
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
        <small className="text-gray-500 mt-1">
          Hold Ctrl (Cmd on Mac) to select multiple colleges
        </small>
      </div>

      {/* Is Group */}
      <div className="flex items-center gap-4 mt-2">
        <span className="font-semibold">Session Type:</span>
        <label>
          <input
            type="radio"
            name="isGroup"
            checked={newSession.isGroup === true}
            onChange={() => setNewSession({ ...newSession, isGroup: true })}
          />{" "}
          Group
        </label>
        <label>
          <input
            type="radio"
            name="isGroup"
            checked={newSession.isGroup === false}
            onChange={() => setNewSession({ ...newSession, isGroup: false })}
          />{" "}
          1-on-1
        </label>
      </div>

      {/* Fields for Group */}
      {newSession.isGroup && (
        <div className="flex flex-col">
          <label htmlFor="slots" className="font-semibold mb-1">
            Number of Slots
          </label>
          <input
            type="number"
            name="slots"
            id="slots"
            placeholder="Enter number of slots"
            className="w-full p-2 border rounded-lg"
            value={newSession.slots || ""}
            onChange={(e) => setNewSession({ ...newSession, slots: parseInt(e.target.value) })}
          />
        </div>
      )}

      {/* Fields for 1-on-1 */}
      {newSession.isGroup === false && (
        <>
          <div className="flex flex-col">
            <label htmlFor="date" className="font-semibold mb-1">
              Date
            </label>
            <input
              type="date"
              name="date"
              id="date"
              className="w-full p-2 border rounded-lg"
              value={newSession.date || ""}
              onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="startTime" className="font-semibold mb-1">
              Start Time
            </label>
            <input
              type="time"
              name="startTime"
              id="startTime"
              className="w-full p-2 border rounded-lg"
              value={newSession.startTime || ""}
              onChange={(e) => setNewSession({ ...newSession, startTime: e.target.value })}
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="totalDuration" className="font-semibold mb-1">
              Total Duration (minutes)
            </label>
            <input
              type="number"
              name="totalDuration"
              id="totalDuration"
              placeholder="Enter total duration"
              className="w-full p-2 border rounded-lg"
              value={newSession.totalDuration || ""}
              onChange={(e) =>
                setNewSession({ ...newSession, totalDuration: parseInt(e.target.value) })
              }
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="slotDuration" className="font-semibold mb-1">
              Slot Duration (minutes)
            </label>
            <input
              type="number"
              name="slotDuration"
              id="slotDuration"
              placeholder="Enter slot duration"
              className="w-full p-2 border rounded-lg"
              value={newSession.slotDuration || ""}
              onChange={(e) =>
                setNewSession({ ...newSession, slotDuration: parseInt(e.target.value) })
              }
            />
          </div>
        </>
      )}

      {/* Buttons */}
      <div className="flex justify-end gap-4 mt-4">
        <button
          className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
          onClick={() => setShowForm(false)}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          onClick={handleAddSession}
        >
          Add Session
        </button>
      </div>
    </div>
  </div>
)}




      {/* Participants Modal */}
      {showParticipants && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[450px]">
            <h3 className="text-lg font-bold mb-4">Participants</h3>
            {selectedParticipants.length === 0 ? (
              <p className="text-sm text-gray-500">No participants yet</p>
            ) : (
              <ul className="list-disc pl-5 space-y-2">
                {selectedParticipants.map(user => (
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
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
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
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{selectedSession.title} - Select Date</h2>
            <Calendar onClickDay={handleDateClick} tileClassName={tileClassName} />

            {selectedDate && availableSlots.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 font-semibold">
                  Available Slots on {selectedDate.toDateString()}:
                </p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {availableSlots.map(slot => {
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

            <button
              className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
              onClick={() => setShowCalendar(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      {showDialog && selectedSession && (selectedSession.isGroup || selectedSlot) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Confirm Booking</h2>
            <p className="mb-4">
              Are you sure you want to {selectedSession.isGroup ? "join" : "book"}{" "}
              <strong>{selectedSession.title}</strong>
              {!selectedSession.isGroup && selectedSlot ? ` at ${selectedSlot}` : ""}?
            </p>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
                onClick={() => setShowDialog(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
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
  );
}
