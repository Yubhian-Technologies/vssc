import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { useAuth } from "../AuthContext";
import red2 from "@/assets/red2.png";
import { motion } from "framer-motion";
import MyBookingsPage from "./MyBookingsPage";
import { User } from "lucide-react"; // ← ADDED

interface Appointment {
  id: string;
  facultyId: string;     // ← NEW: needed to fetch photo
  facultyName: string;
  subject: string;
  doubt: string;
  status: "pending" | "accepted" | "ignored";
  scheduledAt?: string;
  profileUrl?: string;   // ← NEW: faculty photo
}

const RequestedAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<"appointments" | "activities">("appointments");

  const fetchAppointments = async () => {
    if (!user) return;

    const q = query(collection(db, "appointments"), where("studentId", "==", user.uid));
    const snap = await getDocs(q);

    const list: Appointment[] = [];

    for (const d of snap.docs) {
      const data = d.data();
      // Fetch faculty profile photo
      const facultyDoc = await getDoc(doc(db, "users", data.facultyId));
      const profileUrl = facultyDoc.exists() ? facultyDoc.data()?.profileUrl : undefined;

      list.push({
        id: d.id,
        facultyId: data.facultyId,
        facultyName: data.facultyName,
        subject: data.subject,
        doubt: data.doubt,
        status: data.status,
        scheduledAt: data.scheduledAt,
        profileUrl,
      });
    }

    setAppointments(list);
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const cancelAppointment = async (id: string) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this appointment?");
    if (!confirmCancel) return;

    try {
      await deleteDoc(doc(db, "appointments", id));
      setAppointments((prev) => prev.filter((app) => app.id !== id));
    } catch (error) {
      console.error("Error cancelling appointment:", error);
    }
  };

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative w-full h-72 md:h-96 lg:h-[28rem]">
        <img
          src={red2}
          alt="Appointment Banner"
          className="w-full h-full object-contain object-top"
        />
        <div className="absolute inset-0 bg-black bg-opacity-70"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-4">
          <motion.h1
            className="text-3xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Your Appointments
          </motion.h1>
          <p className="max-w-2xl text-lg text-gray-200">
            Request, track, and stay organized with all your faculty appointments in one place.
          </p>
        </div>
      </div>

      {/* Nav Bar */}
      <div className="bg-[hsl(60,100%,95%)] shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex justify-center">
            <div className="flex-1 flex justify-center">
              <button
                onClick={() => setActiveTab("appointments")}
                className={`relative inline-flex items-center justify-center py-3 text-base font-medium transition-all duration-300 ${
                  activeTab === "appointments"
                    ? "text-primary after:content-[''] after:absolute after:-bottom-[2px] after:left-1/2 after:-translate-x-1/2 after:w-[50%] after:h-[3px] after:bg-primary after:rounded-t-full"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Appointments
              </button>
            </div>
            <div className="flex-1 flex justify-center">
              <button
                onClick={() => setActiveTab("activities")}
                className={`relative inline-flex items-center justify-center py-3 text-base font-medium transition-all duration-300 ${
                  activeTab === "activities"
                    ? "text-primary after:content-[''] after:absolute after:-bottom-[2px] after:left-1/2 after:-translate-x-1/2 after:w-[80%] after:h-[3px] after:bg-primary after:rounded-t-full"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                My Activities
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === "appointments" ? (
          <div className="p-6 max-w-4xl mx-auto">
            {appointments.length === 0 ? (
              <p className="text-gray-500 text-lg text-center">No requests found.</p>
            ) : (
              <ul className="space-y-5">
                {appointments.map((app) => (
                  <li
                    key={app.id}
                    className="border border-gray-200 rounded-xl shadow-md p-6 [background-color:hsl(60,100%,95%)] hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Faculty Photo + Info */}
                      <div className="flex items-start gap-4 flex-1">
                        {/* Photo */}
                        <div className="flex-shrink-0">
                          {app.profileUrl ? (
                            <img
                              src={app.profileUrl}
                              alt={app.facultyName}
                              className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center shadow-sm">
                              <User className="w-7 h-7 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="space-y-2 flex-1">
                          <p className="text-xl font-bold text-gray-900">{app.facultyName}</p>
                          <p className="text-gray-700 text-sm">
                            <span className="font-semibold">Subject:</span> {app.subject}
                          </p>
                          <p className="text-gray-700 text-sm">
                            <span className="font-semibold">Doubt:</span> {app.doubt}
                          </p>
                          {app.scheduledAt && (
                            <p className="text-gray-500 text-sm">
                              <span className="font-semibold">Scheduled At:</span> {app.scheduledAt}
                            </p>
                          )}
                          <p className="mt-2">
                            <span className="font-semibold text-md">Status:</span>{" "}
                            {app.status === "pending" && (
                              <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-sm font-medium">
                                Pending
                              </span>
                            )}
                            {app.status === "accepted" && (
                              <span className="inline-block bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-sm font-medium">
                                Accepted
                              </span>
                            )}
                            {app.status === "ignored" && (
                              <span className="inline-block bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-sm font-medium">
                                Rejected
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Cancel Button */}
                      {app.status === "pending" && (
                        <button
                          onClick={() => cancelAppointment(app.id)}
                          className="mt-3 md:mt-0 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-sm transition-all duration-200"
                        >
                          Cancel Appointment
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="p-6 max-w-7xl mx-auto">
            <MyBookingsPage />
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default RequestedAppointments;