import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  increment,
} from "firebase/firestore";
import { useAuth } from "../AuthContext";
import { Users, Clock, BookOpen, User as UserIcon } from "lucide-react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';

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
  date?: string;       // YYYY-MM-DD
  startTime?: string;  // "10:00 PM"
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

  // Fetch sessions
  useEffect(() => {
    const fetchSessions = async () => {
      const querySnapshot = await getDocs(collection(db, "tutoring"));
      const allSessions: TutoringSession[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as TutoringSession),
      }));

      const filtered = allSessions.filter(session =>
        session.colleges.includes(userCollege)
      );

      // Prepare bookedSlots for 1-on-1 sessions
      const updatedSessions = filtered.map(session => {
        if (!session.isGroup && session.slotDuration && session.totalDuration && session.date) {
          if (!session.bookedSlots || session.bookedSlots.length === 0) {
            const slotCount = Math.floor(session.totalDuration / session.slotDuration);
            const bookedSlots = Array.from({ length: slotCount }, (_, i) => {
              const [hoursStr, minutesStr] = session.startTime!.split(":");
              let hours = parseInt(hoursStr);
              const minutes = parseInt(minutesStr);
              if (session.startTime!.toLowerCase().includes("pm") && hours < 12) hours += 12;
              const slotDate = new Date(session.date!);
              slotDate.setHours(hours, minutes + i * session.slotDuration, 0, 0);
              const timeStr = `${slotDate.getHours().toString().padStart(2,"0")}:${slotDate.getMinutes().toString().padStart(2,"0")}`;
              return { time: timeStr, booked: false, user: null };
            });
            return { ...session, bookedSlots, slotAvailable: slotCount };
          }
        }
        return session;
      });

      setSessions(updatedSessions);
    };

    if (userCollege) fetchSessions();
  }, [userCollege]);

  // Helpers
  const parseDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const normalizeDate = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  // Check if user already booked any 1-on-1 slot
  const hasUserBookedAnySlot = (userId: string) => {
    return sessions.some(session =>
      !session.isGroup && session.bookedSlots?.some(bs => bs.user === userId)
    );
  };

  const tileClassName = ({ date }: any) => {
    return sessions.some(session => {
      if (!session.date || (session.isGroup && session.slots === 0) || (!session.isGroup && session.slotAvailable === 0)) return false;
      const sessionDate = normalizeDate(parseDate(session.date));
      const currentDate = normalizeDate(date);
      return sessionDate.getTime() === currentDate.getTime();
    }) ? "bg-green-300 rounded-full" : "";
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
        setSessions(prev =>
          prev.map(s =>
            s.id === selectedSession.id
              ? { ...s, slots: s.slots ? s.slots - 1 : 0, participants: [...(s.participants || []), user.uid] }
              : s
          )
        );
        alert("You joined the group session!");
      } else {
        // 1-on-1 restriction
        if (hasUserBookedAnySlot(user.uid)) {
          alert("You can only book one 1-on-1 slot across all sessions.");
          return;
        }

        const slotIndex = selectedSession.bookedSlots?.findIndex(s => s.time === selectedSlot);
        if (slotIndex === undefined || slotIndex < 0) return;

        if (!selectedSession.bookedSlots![slotIndex].booked) {
          await updateDoc(sessionRef, {
            [`bookedSlots.${slotIndex}.booked`]: true,
            [`bookedSlots.${slotIndex}.user`]: user.uid,
            slotAvailable: increment(-1),
          });

          setAvailableSlots(prev =>
            prev.map(s => s.time === selectedSlot ? { ...s, booked: true, user: user.uid } : s)
          );

          setSessions(prev =>
            prev.map(s =>
              s.id === selectedSession.id
                ? {
                    ...s,
                    bookedSlots: s.bookedSlots?.map(bs =>
                      bs.time === selectedSlot ? { ...bs, booked: true, user: user.uid } : bs
                    ),
                    slotAvailable: s.slotAvailable ? s.slotAvailable - 1 : 0,
                  }
                : s
            )
          );

          alert(`You booked the slot at ${selectedSlot}`);
        } else {
          alert("This slot is already booked.");
        }
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
            <div key={session.id} className="group relative bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden p-6">
              <div className="absolute top-0 right-0 px-3 py-1 text-xs font-semibold bg-blue-600 text-white rounded-bl-lg">
                {session.isGroup ? "Group" : "1-on-1"}
              </div>
              <h2 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition">{session.title}</h2>
              <p className="text-gray-600 mt-2 flex-1">{session.description}</p>
              <div className="mt-4 space-y-2 text-sm text-gray-700">
                <p className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-blue-600" /> 
                  <span><strong>Tutor:</strong> {session.tutorName}</span>
                </p>
                <p className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-green-600" /> 
                  <span><strong>Skills:</strong> {session.skills.join(", ")}</span>
                </p>
                {session.isGroup ? (
                  <p className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-pink-600" /> 
                    <span><strong>Slots Left:</strong> {session.slots}</span>
                  </p>
                ) : (
                  <p className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-600" /> 
                    <span><strong>One-to-One Slots:</strong> {session.slotAvailable}</span>
                  </p>
                )}
              </div>
              <button
                className={`mt-5 w-full py-2 rounded-lg font-semibold text-white transition 
                  ${session.isGroup 
                    ? session.slots && session.slots > 0 
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-600 hover:to-blue-600" 
                      : "bg-gray-400 cursor-not-allowed"
                    : session.slotAvailable && session.slotAvailable > 0 && !hasUserBookedAnySlot(user.uid!)
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-600 hover:to-blue-600"
                      : "bg-gray-400 cursor-not-allowed"}`}
                onClick={() => handleBookSlot(session)}
                disabled={(session.isGroup && (!session.slots || session.slots <= 0)) || (!session.isGroup && (!session.slotAvailable || session.slotAvailable <= 0 || hasUserBookedAnySlot(user.uid!)))}
              >
                {session.isGroup 
                  ? (session.slots && session.slots > 0 ? "Join Session" : "Full") 
                  : (!hasUserBookedAnySlot(user.uid!) && session.slotAvailable && session.slotAvailable > 0 ? "Book a Slot" : "Already Booked")}
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
            <Calendar
              onClickDay={handleDateClick}
              tileClassName={tileClassName}
            />

            {selectedDate && availableSlots.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 font-semibold">Available Slots on {selectedDate.toDateString()}:</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {availableSlots.map(slot => (
                    <button
                      key={slot.time}
                      className={`py-2 rounded-lg text-sm font-semibold text-white transition
                        ${slot.booked 
                          ? "bg-gray-400 cursor-not-allowed" 
                          : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-600 hover:to-blue-600"}`}
                      onClick={() => handleSlotSelect(slot.time)}
                      disabled={slot.booked || hasUserBookedAnySlot(user.uid!)}
                    >
                      {slot.time} {slot.booked ? "(Booked)" : ""}
                    </button>
                  ))}
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
              Are you sure you want to {selectedSession.isGroup ? "join" : "book"} <strong>{selectedSession.title}</strong>{!selectedSession.isGroup && selectedSlot ? ` at ${selectedSlot}` : ""}?
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
