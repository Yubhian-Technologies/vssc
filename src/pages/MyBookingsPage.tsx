import React, { useEffect, useState, useMemo } from "react";
import { db } from "@/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/AuthContext";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

// Unified Booking Interface
interface UnifiedBooking {
  id: string;
  serviceType:
    | "Tutoring"
    | "Academic Advising"
    | "Study Workshop"
    | "Counseling"
    | "Psychology Counseling";
  sessionId: string;
  title: string;
  tutorName: string;
  date: string;
  startTime?: string;
  slotTime?: string;
  type: "group" | "1-on-1";
  skills: string[];
  colleges: string[];
  description: string;
  expiryDate?: string;
  expiryTime?: string;
  status: "upcoming" | "confirmed" | "expired" | "cancelled";
  bookedAt: string; // ✅ exact time user booked
}

// Service-to-Collection Mapping
const SERVICE_COLLECTIONS: Record<UnifiedBooking["serviceType"], string> = {
  Tutoring: "tutoring",
  "Academic Advising": "academicadvising",
  "Study Workshop": "studyworkshop",
  Counseling: "counseling",
  "Psychology Counseling": "psychologycounseling",
} as const;

const isSessionExpired = (expiryDate?: string, expiryTime?: string): boolean => {
  if (!expiryDate || !expiryTime) return false;
  const [year, month, day] = expiryDate.split("-").map(Number);
  const [hours, minutes] = expiryTime.split(":").map(Number);
  const expiryDateTime = new Date(year, month - 1, day, hours, minutes);
  return new Date() > expiryDateTime;
};

// Generic booking fetcher
const fetchServiceBookings = (
  userId: string,
  serviceType: UnifiedBooking["serviceType"],
  setBookings: React.Dispatch<React.SetStateAction<UnifiedBooking[]>>
): (() => void) => {
  const collectionName = SERVICE_COLLECTIONS[serviceType];
  const q = collection(db, collectionName);

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const allSessions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as any),
    }));

    const userBookings: UnifiedBooking[] = [];

    allSessions.forEach((session: any) => {
      let isBooked = false;
      let slotTime: string | undefined;
      let bookedAt: string = new Date().toISOString();

      if (session.isGroup) {
        isBooked = session.participants?.includes(userId) || false;
        // Use when the user joined if available
        const participantData = session.participantDetails?.find(
          (p: any) => p.user === userId
        );
        if (participantData?.bookedAt?.toDate) {
          bookedAt = participantData.bookedAt.toDate().toISOString();
        }
      } else {
        const bookedSlot = session.bookedSlots?.find(
          (slot: { user?: string; time?: string; bookedAt?: any }) =>
            slot.user === userId
        );
        isBooked = !!bookedSlot;
        if (bookedSlot) {
          slotTime = bookedSlot.time;
          if (bookedSlot.bookedAt?.toDate) {
            bookedAt = bookedSlot.bookedAt.toDate().toISOString();
          }
        }
      }

      if (isBooked && session.date) {
        const status = isSessionExpired(session.expiryDate, session.expiryTime)
          ? "expired"
          : new Date(session.date) > new Date()
          ? "upcoming"
          : "confirmed";

        userBookings.push({
          id: `${session.id}-${userId}`,
          serviceType,
          sessionId: session.id,
          title: session.title,
          tutorName: session.tutorName,
          date: session.date,
          startTime: session.startTime,
          slotTime,
          type: session.isGroup ? "group" : "1-on-1",
          skills: session.skills || [],
          colleges: session.colleges || [],
          description: session.description,
          expiryDate: session.expiryDate,
          expiryTime: session.expiryTime,
          status,
          bookedAt,
        });
      }
    });

    setBookings((prev) => {
      const nonServiceBookings = prev.filter(
        (b) => b.serviceType !== serviceType
      );
      return [...nonServiceBookings, ...userBookings];
    });
  });

  return unsubscribe;
};

export default function MyBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<UnifiedBooking[]>([]);
  const [filter, setFilter] = useState<
    "all" | "upcoming" | "confirmed" | "expired"
  >("all");
  const [selectedService, setSelectedService] = useState<
    UnifiedBooking["serviceType"] | "all"
  >("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [showAll, setShowAll] = useState(false);

  // Fetch bookings from all services
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribers: Array<() => void> = [];

    Object.keys(SERVICE_COLLECTIONS).forEach((serviceTypeKey) => {
      const serviceType = serviceTypeKey as UnifiedBooking["serviceType"];
      const unsub = fetchServiceBookings(user.uid, serviceType, setBookings);
      unsubscribers.push(unsub);
    });

    setLoading(false);

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [user?.uid]);

  // ✅ Sort latest booked first
  const filteredBookings = useMemo(() => {
    let result = [...bookings];

    if (filter !== "all") {
      result = result.filter((b) => b.status === filter);
    }

    if (selectedService !== "all") {
      result = result.filter((b) => b.serviceType === selectedService);
    }

    // ✅ Sort by bookedAt descending (latest booked appears first)
    return result.sort(
      (a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime()
    );
  }, [bookings, filter, selectedService]);

  const displayBookings = showAll ? filteredBookings : filteredBookings.slice(0, 2);

  const getStatusColor = (status: UnifiedBooking["status"]): string => {
    switch (status) {
      case "upcoming":
        return "bg-yellow-50 text-yellow-800 border-yellow-300";
      case "confirmed":
        return "bg-green-50 text-green-800 border-green-300";
      case "expired":
        return "bg-red-50 text-red-800 border-red-300";
      default:
        return "bg-blue-50 text-blue-800 border-blue-300";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500 font-medium">
            Loading your bookings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(60,100%,95%)] py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl font-extrabold text-primary mb-2">
            My Bookings
          </h1>
          <p className="text-lg text-gray-600">
            Manage all your sessions across all services
          </p>
        </motion.div>

        {/* Filters and Stats */}
        {/* (keep your existing filter UI here — unchanged) */}

        {/* Bookings */}
        {filteredBookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 bg-[hsl(60,100%,90%)] rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
              📅
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No bookings found
            </h3>
            <p className="text-gray-500">
              {filter !== "all" || selectedService !== "all"
                ? "Try adjusting your filters"
                : "Book your first session to get started!"}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {displayBookings.map((booking) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[hsl(60,100%,90%)] rounded-xl shadow hover:shadow-lg border border-gray-200 overflow-hidden transition"
              >
                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-primary">
                      {booking.title}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        <span className="text-md font-bold">Tutor:</span>{" "}
                        {booking.tutorName}
                      </p>
                      <p>
                        <strong>Date:</strong>{" "}
                        {new Date(booking.date).toLocaleDateString()}
                      </p>
                      {booking.slotTime && (
                        <p>
                          <strong>Time:</strong> {booking.slotTime}
                        </p>
                      )}
                      <p>
                        <strong>Type:</strong>{" "}
                        {booking.type === "group"
                          ? "Group Session"
                          : "1-on-1 Session"}
                      </p>
                      <p className="text-gray-500">
                        <strong>Booked On:</strong>{" "}
                        {new Date(booking.bookedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-start lg:items-end gap-4 text-sm">
                    <span
                      className={`inline-flex px-4 py-2 font-semibold rounded border ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status.toUpperCase()}
                    </span>
                    <span className="inline-block px-4 py-2 bg-gradient-to-r from-primary to-blue-600 text-white font-medium rounded">
                      {booking.serviceType}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredBookings.length > 2 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-800 transition"
                >
                  {showAll ? (
                    <>
                      See Less
                      <ChevronDown className="h-4 w-4 rotate-180 transition-transform" />
                    </>
                  ) : (
                    <>
                      See More ({filteredBookings.length - 2} more)
                      <ChevronDown className="h-4 w-4 transition-transform" />
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
