import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../AuthContext";

const RequestAppointmentForm = ({ faculty, onClose }: { faculty: any; onClose: () => void }) => {
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [doubt, setDoubt] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !doubt) return alert("Please fill all fields");

    try {
      setLoading(true);
      await addDoc(collection(db, "appointments"), {
        studentId: user?.uid,
        studentName: user?.displayName || "Unknown",
        studentEmail: user?.email,
        facultyId: faculty.uid,
        facultyName: faculty.name,
        facultyEmail: faculty.email,
        subject,
        doubtDescription: doubt,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      alert("Request submitted successfully!");
      onClose();
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Request Appointment with {faculty.name}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Subject Name"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
          <textarea
            placeholder="Explain your doubt..."
            value={doubt}
            onChange={(e) => setDoubt(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 h-28"
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestAppointmentForm;
