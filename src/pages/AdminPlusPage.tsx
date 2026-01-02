// src/pages/AdminPlusPage.tsx

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { db } from "../firebase";
import { getDoc,doc } from "firebase/firestore";
import {
  collection,
  getDocs,
  query,
  where,
  onSnapshot,
  DocumentData,
  Timestamp,
} from "firebase/firestore";
import { useAuth } from "../AuthContext";
import { toastError } from "@/components/ui/sonner";
import red3 from "@/assets/red3.png";
import { Calendar } from "lucide-react";

interface Appointment {
  id: string;
  facultyId: string;
  facultyName: string;
  studentId: string;
  studentName: string;
  subject: string;
  doubt: string;
  status: "pending" | "accepted" | "ignored";
  scheduledAt?: string;
  createdAt?: Timestamp;
  college?: string; // Assuming college is stored in appointment or we'll derive from faculty
}

const AdminPlusPage = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedCollege, setSelectedCollege] = useState<string>("all"); // New state for college filter

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return;

      try {
        const snap = await getDocs(
          query(collection(db, "users"), where("uid", "==", user.uid))
        );
        if (!snap.empty) {
          const data = snap.docs[0].data() as DocumentData;
          const userRole = data.role || "student";
          setRole(userRole);

          if (userRole !== "admin+" && userRole !== "superadmin") {
            toastError("Access denied. Admin+ only.");
          }
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        toastError("Failed to load user data");
      }
    };

    fetchUserRole();
  }, [user]);

  useEffect(() => {
    if (!user || !role || (role !== "admin+" && role !== "superadmin")) return;

    const q = collection(db, "appointments");

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const list: Appointment[] = await Promise.all(
          snapshot.docs.map(async (d) => {
            const data = d.data();
            // Try to get college from faculty document
            let college = data.college;
            if (!college && data.facultyId) {
              const facultyDoc = await getDoc(doc(db, "faculty", data.facultyId));
              if (facultyDoc.exists()) {
                college = facultyDoc.data().college;
              }
            }
            return {
              id: d.id,
              ...data,
              createdAt: data.createdAt || null,
              college: college ,
            } as Appointment;
          })
        );
        setAllAppointments(list);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching appointments:", error);
        toastError("Failed to load appointments");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, role]);

  // Get unique colleges for dropdown
  const colleges = useMemo(() => {
    const unique = [...new Set(allAppointments.map(apt => apt.college).filter(Boolean))];
    return unique.sort();
  }, [allAppointments]);

  // Filter by date range + college + SORT BY MOST RECENT FIRST
  const filteredAndSortedAppointments = useMemo(() => {
    let filtered = allAppointments.filter((apt) => {
      // College filter
      if (selectedCollege !== "all" && apt.college !== selectedCollege) {
        return false;
      }

      // Date filter
      if (!apt.createdAt) return true;
      const aptDate = apt.createdAt.toDate();
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;

      if (from && aptDate < from) return false;
      if (to) {
        to.setHours(23, 59, 59, 999);
        if (aptDate > to) return false;
      }
      return true;
    });

    // Sort newest first
    filtered.sort((a, b) => {
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;
      return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime();
    });

    return filtered;
  }, [allAppointments, fromDate, toDate, selectedCollege]);

  const pending = filteredAndSortedAppointments.filter((a) => a.status === "pending");
  const accepted = filteredAndSortedAppointments.filter((a) => a.status === "accepted");
  const rejected = filteredAndSortedAppointments.filter((a) => a.status === "ignored");

  const formatDate = (timestamp?: Timestamp) => {
    if (!timestamp) return "Unknown date";
    return timestamp.toDate().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user || !role || (role !== "admin+" && role !== "superadmin")) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <p className="text-xl text-red-600 font-semibold">
          Access Restricted: Admin+ Only
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen [background-color:hsl(60,100%,95%)]">
      <div className="relative w-full h-72 md:h-96 lg:h-[28rem]">
        <img
          src={red3}
          alt="Admin+ Dashboard"
          className="w-full h-full object-contain object-top"
        />
        <div className="absolute inset-0 bg-black bg-opacity-70"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white px-4">
          <motion.h1
            className="text-3xl md:text-5xl font-bold mb-6 drop-shadow-lg"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Admin+ Dashboard
          </motion.h1>
          <p className="max-w-2xl text-lg text-gray-200">
            Monitor all appointments — newest requests shown first.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* COLLEGE FILTER DROPDOWN - ADDED AT TOP */}
        <div className="mb-8">
          <label className="block text-lg font-bold text-gray-800 mb-3">Filter by College</label>
          <select
            value={selectedCollege}
            onChange={(e) => setSelectedCollege(e.target.value)}
            className="w-full max-w-md px-4 py-1.5 border-2 border-yellow-400 rounded-xl bg-white text-gray-800 font-medium text-lg focus:outline-none focus:ring-4 focus:ring-yellow-300 focus:border-yellow-600 transition-all shadow-lg hover:shadow-xl cursor-pointer"
          >
            <option value="all">All Colleges</option>
            {colleges.map((college) => (
              <option key={college} value={college}>
                {college}
              </option>
            ))}
          </select>
        </div>

        <h2 className="text-3xl font-bold text-center text-primary mb-8">
          All Appointments Overview ({filteredAndSortedAppointments.length} total)
        </h2>

        {loading ? (
          <p className="text-center text-gray-600 text-lg animate-pulse">
            Loading appointments...
          </p>
        ) : (
          <div className="space-y-12">
            {/* Pending */}
            <section>
              <h3 className="text-2xl font-bold text-yellow-800 mb-4">
                Pending Requests ({pending.length})
              </h3>
              {pending.length === 0 ? (
                <p className="text-gray-500">No pending requests.</p>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pending.map((apt) => (
                    <AppointmentCard key={apt.id} apt={apt} status="pending" formatDate={formatDate} />
                  ))}
                </div>
              )}
            </section>

            {/* Accepted */}
            <section>
              <h3 className="text-2xl font-bold text-green-800 mb-4">
                Accepted & Scheduled ({accepted.length})
              </h3>
              {accepted.length === 0 ? (
                <p className="text-gray-500">No accepted appointments.</p>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {accepted.map((apt) => (
                    <AppointmentCard key={apt.id} apt={apt} status="accepted" formatDate={formatDate} />
                  ))}
                </div>
              )}
            </section>

            {/* Rejected */}
            <section>
              <h3 className="text-2xl font-bold text-red-600 mb-4">
                Rejected ({rejected.length})
              </h3>
              {rejected.length === 0 ? (
                <p className="text-gray-500">No rejected appointments.</p>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rejected.map((apt) => (
                    <AppointmentCard key={apt.id} apt={apt} status="ignored" formatDate={formatDate} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

// AppointmentCard - unchanged
const AppointmentCard = ({
  apt,
  status,
  formatDate,
}: {
  apt: Appointment;
  status: string;
  formatDate: (ts?: Timestamp) => string;
}) => {
  return (
    <div className="[background-color:hsl(60,100%,90%)] border border-gray-200 rounded-xl shadow-md p-5 hover:shadow-xl transition-shadow">
      <div className="mb-4 pb-3 border-b border-gray-300">
        <p className="text-sm font-bold text-gray-800">
          Requested on: {formatDate(apt.createdAt)}
        </p>
      </div>

      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-semibold text-lg">
            {apt.studentName} → {apt.facultyName}
          </p>
          <p className="text-sm text-gray-600 mt-1">Subject: {apt.subject}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium text-white ${
            status === "pending"
              ? "bg-yellow-600"
              : status === "accepted"
              ? "bg-green-600"
              : "bg-red-600"
          }`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>

      <p className="text-sm text-gray-700 mb-3">
        <strong>Doubt:</strong> {apt.doubt}
      </p>

      {apt.scheduledAt && (
        <p className="text-sm text-gray-700">
          <strong>Scheduled:</strong> {apt.scheduledAt}
        </p>
      )}
    </div>
  );
};

export default AdminPlusPage;