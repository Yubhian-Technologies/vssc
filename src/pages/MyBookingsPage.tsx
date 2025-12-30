import React, { useState, useMemo } from "react";
import { useAuth } from "@/AuthContext";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useUserBookings, UnifiedBooking } from "@/hooks/useUserBookings";

export default function MyBookingsPage() {
  const { user } = useAuth();
  const { bookings, isLoading } = useUserBookings(user?.uid);
  const [filter, setFilter] = useState<"all" | "upcoming" | "confirmed" | "expired" | "completed">("all");
  const [selectedService, setSelectedService] = useState<UnifiedBooking["serviceType"] | "all">("all");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [showAll, setShowAll] = useState(false);

  // Filter and sort bookings
  const filteredBookings = useMemo(() => {
    let result = [...bookings];

    // Filter by selected date
    if (selectedDate) {
      result = result.filter((b) => b.date === selectedDate);
    } else if (filter !== "all") {
      result = result.filter((b) => b.status === filter);
    }

    if (selectedService !== "all") {
      result = result.filter((b) => b.serviceType === selectedService);
    }

    const statusOrder: Record<UnifiedBooking["status"], number> = {
      upcoming: 0,
      confirmed: 1,
      expired: 2,
      cancelled: 3,
      completed: 4,
    };

    result.sort((a, b) => {
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      const dateA = new Date(a.date + " " + (a.slotTime || "00:00"));
      const dateB = new Date(b.date + " " + (b.slotTime || "00:00"));
      return dateA.getTime() - dateB.getTime();
    });

    return result;
  }, [bookings, filter, selectedService, selectedDate]);

  const displayBookings = showAll ? filteredBookings : filteredBookings.slice(0, 2);

  const getStatusColor = (status: UnifiedBooking["status"]): string => {
    switch (status) {
      case "upcoming":
        return "bg-yellow-50 text-yellow-800 border-yellow-300";
      case "confirmed":
        return "bg-green-50 text-green-800 border-green-300";
      case "expired":
        return "bg-red-50 text-red-800 border-red-300";
      case "completed":
        return "bg-blue-50 text-blue-800 border-blue-300";
      default:
        return "bg-gray-50 text-gray-800 border-gray-300";
    }
  };

  if (isLoading) {
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

        {/* Filter Controls */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4"
        >

          <div className="flex flex-wrap gap-2">
            {(["all", "upcoming", "confirmed", "expired", "completed"] as const).map((status) => (
              <button
                key={status}
                onClick={() => {
                  setFilter(status);
                  setSelectedDate("");
                }}
                className={`px-4 py-2 rounded-lg border font-medium transition ${
                  filter === status
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <select
              value={selectedService}
              onChange={(e) =>
                setSelectedService(e.target.value as UnifiedBooking["serviceType"] | "all")
              }
              className="border border-gray-300 rounded-lg px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-auto"
            >
              <option value="all">All Services</option>
              <option value="Tutoring">Tutoring</option>
              <option value="Academic Advising">Academic Advising</option>
              <option value="Study Workshop">Study Workshop</option>
              <option value="Counseling">Counseling</option>
              <option value="Psychology Counseling">Psychology Counseling</option>
            </select>

             
           
          </div>

          
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-start sm:items-center mb-3">
          <label className="text-gray-700 text-md font-medium mb-1 sm:mb-0 sm:mr-2">
            Pick a date to view bookings:
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          />
        </div>

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
              {filter !== "all" || selectedService !== "all" || selectedDate
                ? "Try adjusting your filters or date"
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
                        {booking.type === "group" ? "Group Session" : "1-on-1 Session"}
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
