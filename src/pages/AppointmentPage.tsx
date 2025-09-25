import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
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
  scheduledAt?: string; // optional
}

const AppointmentPage = () => {
  const { user } = useAuth(); // ✅ useAuth returns { user }
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [subject, setSubject] = useState("");
  const [doubt, setDoubt] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);

  // Fetch faculty if student
  useEffect(() => {
    const fetchFaculty = async () => {
      if (!user) return;

      // Get current student info
      const studentsSnap = await getDocs(
        query(collection(db, "users"), where("uid", "==", user.uid))
      );

      if (!studentsSnap.empty) {
        const studentData = studentsSnap.docs[0].data() as DocumentData;
        const college = studentData.college;

        // Fetch faculty from same college
        const facultySnap = await getDocs(
          query(collection(db, "faculty"), where("college", "==", college))
        );

        const facultyList: Faculty[] = facultySnap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Faculty, "id">),
        }));

        setFaculty(facultyList);
      }
    };

    fetchFaculty();
  }, [user]);

  // Fetch appointments if admin
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return;

      const studentsSnap = await getDocs(
        query(collection(db, "students"), where("email", "==", user.email))
      );

      if (!studentsSnap.empty) {
        const studentData = studentsSnap.docs[0].data() as DocumentData;
        if (studentData.role === "admin") {
          const appointmentsSnap = await getDocs(collection(db, "appointments"));
          const requests: Appointment[] = appointmentsSnap.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Appointment, "id">),
          }));
          setAppointments(requests);
        }
      }
    };

    fetchAppointments();
  }, [user]);

  // Request appointment
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
    alert("Appointment request sent ✅");
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Appointment Page</h1>

      {/* Student flow: list faculty */}
      {faculty.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Available Faculty</h2>
          <ul className="space-y-2">
            {faculty.map((f) => (
              <li key={f.id} className="border p-3 rounded-md">
                <p>
                  <span className="font-semibold">{f.name}</span> — {f.college}
                </p>
                <p className="text-sm">Skills: {f.skills.join(", ")}</p>
                <button
                  onClick={() => setSelectedFaculty(f)}
                  className="mt-2 bg-blue-500 text-white px-3 py-1 rounded-md"
                >
                  Request Appointment
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Request form */}
      {selectedFaculty && (
        <div className="mt-6 p-4 border rounded-md">
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
          <button
            onClick={handleRequest}
            className="bg-green-500 text-white px-4 py-2 rounded-md"
          >
            Submit Request
          </button>
        </div>
      )}

      {/* Admin flow: view requests */}
      {appointments.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">Appointment Requests</h2>
          <ul className="space-y-2">
            {appointments.map((req) => (
              <li key={req.id} className="border p-3 rounded-md">
                <p>
                  <strong>{req.studentName}</strong> → {req.facultyName}
                </p>
                <p className="text-sm">Subject: {req.subject}</p>
                <p className="text-sm">Doubt: {req.doubt}</p>
                <p className="text-sm">Status: {req.status}</p>
                {/* Later: Accept / Ignore buttons with scheduling */}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AppointmentPage;
