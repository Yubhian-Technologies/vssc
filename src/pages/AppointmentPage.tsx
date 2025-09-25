import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  DocumentData,
} from "firebase/firestore";
import { useAuth } from "../AuthContext";

interface Faculty {
  id: string;
  name: string;
  college: string;
  skills: string[];
}

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
}

const AppointmentPage = () => {
  const { user } = useAuth();
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [role, setRole] = useState<string | null>(null);
  const [college, setCollege] = useState<string | null>(null);

  const [subject, setSubject] = useState("");
  const [doubt, setDoubt] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [schedulingId, setSchedulingId] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  // 🔹 Fetch user role + college
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user) return;
      const snap = await getDocs(
        query(collection(db, "users"), where("uid", "==", user.uid))
      );
      if (!snap.empty) {
        const data = snap.docs[0].data() as DocumentData;
        setRole(data.role || "student");
        setCollege(data.college || null);
      }
    };
    fetchUserDetails();
  }, [user]);

  // 🔹 Student: fetch faculty from same college
  useEffect(() => {
    const fetchFaculty = async () => {
      if (role !== "student" || !college) return;

      const snap = await getDocs(
        query(collection(db, "faculty"), where("college", "==", college))
      );

      const list: Faculty[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Faculty, "id">),
      }));

      setFaculty(list);
    };
    fetchFaculty();
  }, [role, college]);

  // 🔹 Admin: fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      if (role !== "admin") return;

      const snap = await getDocs(collection(db, "appointments"));
      const list: Appointment[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Appointment, "id">),
      }));
      setAppointments(list);
    };
    fetchAppointments();
  }, [role]);

  // 🔹 Student: request appointment
  const handleRequest = async () => {
    if (!user || !selectedFaculty) return;

    await addDoc(collection(db, "appointments"), {
      facultyId: selectedFaculty.id,
      facultyName: selectedFaculty.name,
      studentId: user.uid,
      studentName: user.displayName || user.email,
      subject,
      doubt,
      status: "pending",
    });

    setSubject("");
    setDoubt("");
    setSelectedFaculty(null);
    setModalOpen(false);
    alert("Appointment request sent ✅");
  };

  // 🔹 Admin: accept appointment
  const handleAccept = async (id: string) => {
    if (!scheduleDate || !scheduleTime) {
      alert("Select date and time");
      return;
    }

    const scheduledAt = `${scheduleDate} ${scheduleTime}`;
    await updateDoc(doc(db, "appointments", id), {
      status: "accepted",
      scheduledAt,
    });

    // Update local state
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "accepted", scheduledAt } : a))
    );

    setSchedulingId(null);
    setScheduleDate("");
    setScheduleTime("");
  };

  // 🔹 Admin: reject appointment
  const handleIgnore = async (id: string) => {
    await updateDoc(doc(db, "appointments", id), { status: "ignored" });

    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "ignored" } : a))
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Appointment Page</h1>

      {/* STUDENT FLOW */}
      {role === "student" && faculty.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Available Faculty</h2>
          <ul className="space-y-2">
            {faculty.map((f) => (
              <li key={f.id} className="border p-3 rounded-md flex justify-between items-center">
                <div>
                  <p><span className="font-semibold">{f.name}</span> — {f.college}</p>
                  <p className="text-sm">Skills: {f.skills.join(", ")}</p>
                </div>
                <button
                  onClick={() => { setSelectedFaculty(f); setModalOpen(true); }}
                  className="bg-blue-500 text-white px-3 py-1 rounded-md"
                >
                  Request
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* MODAL FOR REQUEST */}
      {modalOpen && selectedFaculty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-md w-96">
            <h3 className="font-semibold mb-2">
              Request Appointment with {selectedFaculty.name}
            </h3>
            <input
              type="text"
              placeholder="Subject Name"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="block w-full border p-2 mb-2 rounded"
            />
            <textarea
              placeholder="Explain your doubt"
              value={doubt}
              onChange={(e) => setDoubt(e.target.value)}
              className="block w-full border p-2 mb-2 rounded"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setModalOpen(false)}
                className="bg-gray-500 text-white px-3 py-1 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleRequest}
                className="bg-green-500 text-white px-3 py-1 rounded-md"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN FLOW */}
      {role === "admin" && (
        <div className="mt-6 space-y-6">
          {/* PENDING */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Pending Requests</h2>
            <ul className="space-y-2">
              {appointments.filter(a => a.status === "pending").map(req => (
                <li key={req.id} className="border p-3 rounded-md">
                  <p><strong>{req.studentName}</strong> → {req.facultyName}</p>
                  <p className="text-sm">Subject: {req.subject}</p>
                  <p className="text-sm">Doubt: {req.doubt}</p>

                  {schedulingId === req.id ? (
                    <div className="mt-2 space-y-2">
                      <input
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className="border p-2 rounded w-full"
                      />
                      <input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="border p-2 rounded w-full"
                      />
                      <button
                        onClick={() => handleAccept(req.id)}
                        className="bg-green-500 text-white px-3 py-1 rounded-md"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setSchedulingId(null)}
                        className="bg-gray-500 text-white px-3 py-1 rounded-md"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => setSchedulingId(req.id)}
                        className="bg-blue-500 text-white px-3 py-1 rounded-md"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleIgnore(req.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded-md"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* APPROVED */}
          <div>
            <h2 className="text-lg font-semibold mb-2 text-green-600">Approved</h2>
            <ul className="space-y-2">
              {appointments.filter(a => a.status === "accepted").map(req => (
                <li key={req.id} className="border p-3 rounded-md">
                  <p><strong>{req.studentName}</strong> → {req.facultyName}</p>
                  <p className="text-sm">Subject: {req.subject}</p>
                  <p className="text-sm">Scheduled At: {req.scheduledAt}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* REJECTED */}
          <div>
            <h2 className="text-lg font-semibold mb-2 text-red-600">Rejected</h2>
            <ul className="space-y-2">
              {appointments.filter(a => a.status === "ignored").map(req => (
                <li key={req.id} className="border p-3 rounded-md">
                  <p><strong>{req.studentName}</strong> → {req.facultyName}</p>
                  <p className="text-sm">Subject: {req.subject}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentPage;
