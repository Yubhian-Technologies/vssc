import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
import { useAuth } from "../AuthContext";
import red2 from "@/assets/red2.png";
import {motion} from "framer-motion";

interface Appointment {
  id: string;
  facultyName: string;
  subject: string;
  doubt: string;
  status: "pending" | "accepted" | "ignored";
  scheduledAt?: string;
}

const RequestedAppointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const fetchAppointments = async () => {
    if (!user) return;

    const q = query(collection(db, "appointments"), where("studentId", "==", user.uid));
    const snap = await getDocs(q);

    const list: Appointment[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Appointment, "id">),
    }));

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

    <div className="p-6 max-w-4xl mx-auto">
      
      {appointments.length === 0 ? (
        <p className="text-gray-500 text-lg">No requests found.</p>
      ) : (
        <ul className="space-y-5">
  {appointments.map((app) => (
    <li
      key={app.id}
      className="border border-gray-200 rounded-xl shadow-md p-6 [background-color:hsl(60,100%,95%)] hover:shadow-lg transition-all duration-300"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 space-y-2">
          {/* Faculty Name */}
          <p className="text-xl font-bold text-gray-900">{app.facultyName}</p>

          {/* Subject and Doubt */}
          <p className="text-gray-700 text-sm">
            <span className="font-semibold">Subject:</span> {app.subject}
          </p>
          <p className="text-gray-700 text-sm">
            <span className="font-semibold">Doubt:</span> {app.doubt}
          </p>

          {/* Scheduled time */}
          {app.scheduledAt && (
            <p className="text-gray-500 text-sm">
              <span className="font-semibold">Scheduled At:</span> {app.scheduledAt}
            </p>
          )}

          {/* Status badge */}
          <p className="mt-2">
            <span className="font-semibold text-md">Status:</span>{" "}
            {app.status === "pending" && (
              <span className="inline-block  text-yellow-800 px-2 py-0.5 rounded-full text-sm font-medium">
                Pending
              </span>
            )}
            {app.status === "accepted" && (
              <span className="inline-block text-green-800 px-2 py-0.5 rounded-full text-sm font-medium">
                Accepted
              </span>
            )}
            {app.status === "ignored" && (
              <span className="inline-block  text-red-800 px-2 py-0.5 rounded-full text-sm font-medium">
                Rejected
              </span>
            )}
          </p>
        </div>

        {/* Cancel Button */}
        {app.status === "pending" && (
          <button
            onClick={() => cancelAppointment(app.id)}
            className="mt-3 md:mt-0 md:ml-6 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-sm transition-all duration-200"
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
    </div>
  );
};

export default RequestedAppointments;
