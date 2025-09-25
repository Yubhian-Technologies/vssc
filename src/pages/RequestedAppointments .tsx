import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where, DocumentData } from "firebase/firestore";
import { useAuth } from "../AuthContext";

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

  useEffect(() => {
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

    fetchAppointments();
  }, [user]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Requested Appointments</h1>

      {appointments.length === 0 ? (
        <p>No requests found.</p>
      ) : (
        <ul className="space-y-4">
          {appointments.map((app) => (
            <li key={app.id} className="border p-4 rounded-md">
              <p>
                <span className="font-semibold">{app.facultyName}</span>
              </p>
              <p className="text-sm">Subject: {app.subject}</p>
              <p className="text-sm">Doubt: {app.doubt}</p>
              <p className="text-sm">
                Status:{" "}
                {app.status === "pending" ? (
                  <span className="text-yellow-600">Pending</span>
                ) : app.status === "accepted" ? (
                  <span className="text-green-600">Accepted</span>
                ) : (
                  <span className="text-red-600">Rejected</span>
                )}
              </p>
              {app.scheduledAt && (
                <p className="text-sm">Scheduled At: {app.scheduledAt}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RequestedAppointments;
