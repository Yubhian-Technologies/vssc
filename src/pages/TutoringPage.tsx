import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  doc,
  updateDoc,
  arrayUnion,
  increment,
  onSnapshot,
  getDoc,
} from "firebase/firestore";
import { useAuth } from "../AuthContext";
import { Users, Clock, BookOpen, User as UserIcon } from "lucide-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

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
  date?: string; // YYYY-MM-DD
  startTime?: string; // "10:00 PM"
  participants?: string[];
  bookedSlots?: {
    time: string;
    booked: boolean;
    user?: string | null;
  }[];
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

  // --- Fetch sessions in real-time ---
  useEffect(() => {
    if (!userCollege) return;
    const q = collection(db, "tutoring");

    const unsubscribe = onSnapshot(q, async snapshot => {
      const allSessions: TutoringSession[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as TutoringSession),
      }));

      const filtered = allSessions.filter(session => session.colleges.includes(userCollege));

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

              // Update Firestore with generated slots
              const sessionRef = doc(db, "tutoring", session.id);
              await updateDoc(sessionRef, {
                bookedSlots: generatedSlots,
                slotAvailable: generatedSlots.length,
              });

              return { ...session, bookedSlots: generatedSlots, slotAvailable: generatedSlots.length };
            }

            // Calculate available slots
            const slotAvailable = session.bookedSlots.filter(s => !s.booked).length;
            return { ...session, slotAvailable };
          }
          return session;
        })
      );

      setSessions(updatedSessions);
    });

    return () => unsubscribe();
  }, [userCollege]);

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
    setShowCalendar(true);
    setSelectedDate(null);
    setSelectedSlot(null);
    setAvailableSlots([]);
  };

  const handleSlotSelect = (slotTime: string) => {
    setSelectedSlot(slotTime);
    setShowDialog(true);
  };

  // --- Confirm booking ---
  const confirmJoin = async () => {
    if (bookingInProgress) return;
    if (!user?.uid || !selectedSession || (!selectedSession.isGroup && !selectedSlot)) return;

    setBookingInProgress(true);
    const sessionRef = doc(db, "tutoring", selectedSession.id);

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
        alert("You joined the group session!");
      } else {
        // Fetch latest session
        const sessionSnap = await getDoc(sessionRef);
        const sessionData = sessionSnap.data() as TutoringSession;
        if (!sessionData.bookedSlots) throw new Error("Slots not found");

        // Only one slot per user
        const alreadyBooked = sessionData.bookedSlots.some(s => s.user === user.uid);
        if (alreadyBooked) {
          alert("You already booked a slot in this session.");
          return;
        }

        // Find slot index
        const slotIndex = sessionData.bookedSlots.findIndex(s => s.time === selectedSlot);
        if (slotIndex < 0) {
          alert("Slot not found.");
          return;
        }

        // Update slots array
        const updatedSlots = [...sessionData.bookedSlots];
        updatedSlots[slotIndex] = { ...updatedSlots[slotIndex], booked: true, user: user.uid };

        await updateDoc(sessionRef, {
          bookedSlots: updatedSlots,
          slotAvailable: updatedSlots.filter(s => !s.booked).length,
        });

        alert(`You booked the slot at ${selectedSlot}`);
      }
    } catch (err) {
      console.error(err);
      alert("Booking failed. Try again.");
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

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <h1 className="text-3xl font-extrabold text-center mb-10 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
        Available Tutoring Sessions
      </h1>

      {sessions.length === 0 ? (
        <p className="text-center text-gray-600">No sessions available for your college.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {sessions.map(session => (
            <div
              key={session.id}
              className="group relative bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden p-6"
            >
              <div className="absolute top-0 right-0 px-3 py-1 text-xs font-semibold bg-blue-600 text-white rounded-bl-lg">
                {session.isGroup ? "Group" : "1-on-1"}
              </div>
              <h2 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition">
                {session.title}
              </h2>
              <p className="text-gray-600 mt-2 flex-1">{session.description}</p>
              <div className="mt-4 space-y-2 text-sm text-gray-700">
                <p className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-blue-600" />
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
                    session.isGroup
                      ? session.slots && session.slots > 0
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-600 hover:to-blue-600"
                        : "bg-gray-400 cursor-not-allowed"
                      : session.slotAvailable && session.slotAvailable > 0
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-600 hover:to-blue-600"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                onClick={() => handleBookSlot(session)}
                disabled={
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
            </div>
          ))}
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
