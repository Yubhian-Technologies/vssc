import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { db } from "../firebase";
import emailjs from "@emailjs/browser";
import { toastSuccess, toastError } from "@/components/ui/sonner";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  DocumentData,
  onSnapshot,
} from "firebase/firestore";
import { useAuth } from "../AuthContext";
import red3 from "@/assets/red3.png";
import { useNavigate } from "react-router-dom";

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
  const [name, setName] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [doubt, setDoubt] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [schedulingId, setSchedulingId] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const navigate = useNavigate();

  // 🔹 Fetch user role + college
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user) return;
      try {
        const snap = await getDocs(
          query(collection(db, "users"), where("uid", "==", user.uid))
        );
        if (!snap.empty) {
          const data = snap.docs[0].data() as DocumentData;
          console.log("User details:", { uid: user.uid, role: data.role, college: data.college, name: data.name });
          setRole(data.role || "student");
          setCollege(data.college || null);
          setName(data.name || null);
        } else {
          console.error("No user document found for UID:", user.uid);
          toastError("User data not found");
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        toastError("Failed to fetch user details");
      }
    };
    fetchUserDetails();
  }, [user]);

  // 🔹 Student: fetch faculty from same college
  useEffect(() => {
    if (role !== "student" || !college) return;

    const q = query(
      collection(db, "faculty"),
      where("college", "==", college),
      where("isReady", "==", true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Faculty[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Faculty, "id">),
      }));
      console.log("Fetched faculty for college:", college, list);
      setFaculty(list);
    }, (error) => {
      console.error("Error fetching faculty:", error);
      toastError("Failed to fetch faculty list");
    });

    return () => unsubscribe();
  }, [role, college]);

  // 🔹 Student: fetch appointments for this student
  useEffect(() => {
    if (role !== "student" || !user) return;

    const q = query(
      collection(db, "appointments"),
      where("studentId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Appointment[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Appointment, "id">),
      }));
      console.log("Fetched appointments for student UID:", user.uid, list);
      setAppointments(list);
    }, (error) => {
      console.error("Error fetching appointments:", error);
      toastError("Failed to fetch appointments");
    });

    return () => unsubscribe();
  }, [role, user]);

  // 🔹 Admin: fetch appointments for this faculty only
  useEffect(() => {
    if (role !== "admin" || !user) return;

    const q = query(
      collection(db, "appointments"),
      where("facultyId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Appointment[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Appointment, "id">),
      }));
      console.log("Fetched appointments for faculty UID:", user.uid, list);
      setAppointments(list);
    }, (error) => {
      console.error("Error fetching appointments:", error);
      toastError("Failed to fetch appointments");
    });

    return () => unsubscribe();
  }, [role, user]);

  // 🔹 Check if appointment is expired
  const isAppointmentExpired = (scheduledAt?: string) => {
    if (!scheduledAt) return true;
    const appointmentDate = new Date(scheduledAt);
    const currentDate = new Date();
    return currentDate > appointmentDate;
  };

  // 🔹 Get appointment status for a faculty
  const getFacultyAppointmentStatus = (facultyId: string) => {
    const appointment = appointments.find(
      (a) => a.facultyId === facultyId && (a.status === "pending" || (a.status === "accepted" && !isAppointmentExpired(a.scheduledAt)))
    );
    return appointment ? { status: appointment.status, scheduledAt: appointment.scheduledAt } : null;
  };

  // 🔹 Student: request appointment
  const handleRequest = async () => {
    if (!user || !selectedFaculty) return;

    try {
      await addDoc(collection(db, "appointments"), {
        facultyId: selectedFaculty.id,
        facultyName: selectedFaculty.name,
        studentId: user.uid,
        studentName: name,
        subject,
        doubt,
        status: "pending",
      });

      setSubject("");
      setDoubt("");
      setSelectedFaculty(null);
      setModalOpen(false);
      toastSuccess("Appointment request sent");
      navigate("/reservations");
      scrollTo(0, 0);
    } catch (error) {
      console.error("Error sending appointment request:", error);
      toastError("Failed to send appointment request");
    }
  };

  // 🔹 Admin: accept appointment
  const handleAccept = async (id: string) => {
    if (!scheduleDate || !scheduleTime) {
      toastError("Select date and time");
      return;
    }

    const scheduledAt = `${scheduleDate} ${scheduleTime}`;

    try {
      await updateDoc(doc(db, "appointments", id), {
        status: "accepted",
        scheduledAt,
      });

      setAppointments((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status: "accepted", scheduledAt } : a
        )
      );

      const appointment = appointments.find((a) => a.id === id);
      if (appointment) {
        const snap = await getDocs(
          query(collection(db, "users"), where("uid", "==", appointment.studentId))
        );

        if (!snap.empty) {
          const studentData = snap.docs[0].data() as DocumentData;
          const toEmail = studentData.email;
          const toName = appointment.studentName;
          const facultyName = appointment.facultyName;

          try {
            await emailjs.send(
              "service_i0sjn21",
              "template_wvfxvl7",
              {
                to_name: toName,
                faculty_name: facultyName,
                scheduled_time: scheduledAt,
                to_email: toEmail,
              },
              "EEoXK9gS-YnOA1hey"
            );
            console.log("Email sent successfully!");
          } catch (error) {
            console.error("Error sending email:", error);
            toastError("Failed to send confirmation email");
          }
        }
      }

      setSchedulingId(null);
      setScheduleDate("");
      setScheduleTime("");
      toastSuccess("Appointment accepted");
    } catch (error) {
      console.error("Error accepting appointment:", error);
      toastError("Failed to accept appointment");
    }
  };

  // 🔹 Admin: reject appointment
  const handleIgnore = async (id: string) => {
    try {
      await updateDoc(doc(db, "appointments", id), { status: "ignored" });

      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "ignored" } : a))
      );
      toastSuccess("Appointment rejected");
    } catch (error) {
      console.error("Error rejecting appointment:", error);
      toastError("Failed to reject appointment");
    }
  };

  return (
    <div className="min-h-screen [background-color:hsl(60,100%,95%)] mt-0 pt-0">
      {role === "student" && (
        <div className="relative w-full h-72 md:h-96 lg:h-[28rem]">
          <img
            src={red3}
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
              Book Your Appointment
            </motion.h1>
            <p className="max-w-2xl text-lg text-gray-200">
              Easily book appointments with mentors and get support for
              academics, career goals, or personal growth.
            </p>
          </div>
        </div>
      )}

      {/* STUDENT FLOW */}
      {role === "student" && (
        <div className="max-w-4xl mx-auto mt-6 p-6">
          <h2 className="text-2xl font-bold mb-4 text-primary text-center">
            Available Faculty
          </h2>
          {faculty.length === 0 ? (
            <p className="text-gray-500 text-lg text-center">No faculty available at your college.</p>
          ) : (
            <ul className="space-y-4">
              {faculty.map((f) => {
                const appointmentStatus = getFacultyAppointmentStatus(f.id);
                return (
                  <li
                    key={f.id}
                    className="flex justify-between items-center [background-color:hsl(60,100%,90%)] p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
                  >
                    <div>
                      <p className="text-xl font-semibold text-primary">
                        {f.name}
                      </p>
                      <p className="text-md text-primary mb-1">{f.college}</p>
                      <p className="text-sm text-primary">
                        Skills: {f.skills.join(", ")}
                      </p>
                      {appointmentStatus && (
                        <p className="text-sm mt-2">
                          {appointmentStatus.status === "pending" ? (
                            <span className="text-yellow-700 font-medium">
                              Pending Appointment
                            </span>
                          ) : (
                            <span className="text-green-700 font-medium">
                              Scheduled: {appointmentStatus.scheduledAt}
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedFaculty(f);
                        setModalOpen(true);
                      }}
                      disabled={!!appointmentStatus}
                      className={`px-4 py-2 rounded-lg font-medium shadow-md transition-colors duration-200 ${
                        appointmentStatus
                          ? "bg-gray-400 cursor-not-allowed text-gray-200"
                          : "bg-green-800 hover:bg-green-600 text-white"
                      }`}
                    >
                      Request Appointment
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* MODAL FOR REQUEST */}
      {modalOpen && selectedFaculty && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-yellow-100 p-6 rounded-sm w-96 shadow-xl border border-yellow-300">
            <h3 className="font-bold text-lg mb-4 text-gray-800">
              Request Appointment with {selectedFaculty.name}
            </h3>
            <input
              type="text"
              placeholder="Subject Name"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="block w-full border border-yellow-300 p-3 mb-3 rounded-lg bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
            />
            <textarea
              placeholder="Explain your doubt"
              value={doubt}
              onChange={(e) => setDoubt(e.target.value)}
              className="block w-full border border-yellow-300 p-3 mb-4 rounded-lg bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition resize-none h-24"
            />
            <div className="flex justify-between gap-3 mt-5">
              <button
                onClick={() => setModalOpen(false)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRequest}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-sm transition"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN FLOW */}
      {role === "admin" && (
        <div className="relative w-full h-72 md:h-96 lg:h-[28rem]">
          <img
            src={red3}
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
              Your Appointment Requests
            </motion.h1>
            <p className="max-w-2xl text-lg text-gray-200">
              Manage appointment requests assigned to you.
            </p>
          </div>
        </div>
      )}

      {role === "admin" && (
        <div className="mt-10 space-y-12 p-7">
          <h2 className="text-2xl font-bold mb-4 text-primary text-center">
            Your Requests
          </h2>

          {/* PENDING */}
          <div>
            <h2 className="text-3xl font-bold mb-6 text-yellow-800">
              Pending Requests
            </h2>
            {appointments.filter((a) => a.status === "pending").length === 0 ? (
              <p className="text-gray-500 text-lg text-center">No pending requests assigned to you.</p>
            ) : (
              <ul className="grid md:grid-cols-2 gap-6">
                {appointments
                  .filter((a) => a.status === "pending")
                  .map((req) => (
                    <li
                      key={req.id}
                      className="[background-color:hsl(60,100%,90%)] border border-blue-200 rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-semibold text-lg">
                          {req.studentName}{" "}
                          <span className="text-gray-400">→</span>{" "}
                          {req.facultyName}
                        </p>
                        <span className="text-yellow-700 font-medium px-3 py-1 rounded-full text-sm">
                          Pending
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-1">
                        Subject: {req.subject}
                      </p>
                      <p className="text-sm text-gray-500 mb-3">
                        Doubt: {req.doubt}
                      </p>
                      {schedulingId === req.id ? (
                        <div className="space-y-2">
                          <input
                            type="date"
                            value={scheduleDate}
                            onChange={(e) => setScheduleDate(e.target.value)}
                            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
                          />
                          <input
                            type="time"
                            value={scheduleTime}
                            onChange={(e) => setScheduleTime(e.target.value)}
                            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleAccept(req.id)}
                              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl font-medium transition"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setSchedulingId(null)}
                              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-xl font-medium transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2 justify-between mt-5">
                          <button
                            onClick={() => setSchedulingId(req.id)}
                            className="bg-green-700 hover:bg-green-900 text-white px-5 py-2 rounded-xl font-medium transition"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleIgnore(req.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl font-medium transition"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
              </ul>
            )}
          </div>

          {/* APPROVED */}
          <div>
            <h2 className="text-3xl font-bold mb-6 text-green-800">
              Approved
            </h2>
            {appointments.filter((a) => a.status === "accepted").length === 0 ? (
              <p className="text-gray-500 text-lg text-center">No approved requests.</p>
            ) : (
              <ul className="grid md:grid-cols-2 gap-6">
                {appointments
                  .filter((a) => a.status === "accepted")
                  .map((req) => (
                    <li
                      key={req.id}
                      className="[background-color:hsl(60,100%,90%)] border border-blue-200 rounded-2xl shadow-md p-6 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-semibold text-lg">
                          {req.studentName}{" "}
                          <span className="text-gray-400">→</span>{" "}
                          {req.facultyName}
                        </p>
                        <span className="text-green-700 font-medium px-3 py-1 rounded-full text-sm">
                          Approved
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-1">
                        Subject: {req.subject}
                      </p>
                      <p className="text-sm text-gray-500">
                        Scheduled At: {req.scheduledAt}
                      </p>
                    </li>
                  ))}
              </ul>
            )}
          </div>

          {/* REJECTED */}
          <div>
            <h2 className="text-3xl font-bold mb-6 text-red-600">
              Rejected
            </h2>
            {appointments.filter((a) => a.status === "ignored").length === 0 ? (
              <p className="text-gray-500 text-lg text-center">No rejected requests.</p>
            ) : (
              <ul className="grid md:grid-cols-2 gap-6">
                {appointments
                  .filter((a) => a.status === "ignored")
                  .map((req) => (
                    <li
                      key={req.id}
                      className="[background-color:hsl(60,100%,90%)] border border-blue-200 rounded-2xl shadow-md p-6 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-semibold text-lg">
                          {req.studentName}{" "}
                          <span className="text-gray-400">→</span>{" "}
                          {req.facultyName}
                        </p>
                        <span className="text-red-700 font-medium px-3 py-1 rounded-full text-sm">
                          Rejected
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Subject: {req.subject}
                      </p>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentPage;