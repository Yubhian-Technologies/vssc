import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import event1 from "@/assets/event1.png";
import two from "@/assets/two.png";
import twelve from "@/assets/twelve.png";
import eleven from "@/assets/eleven.png";
import ten from "@/assets/ten.png";
import eight from "@/assets/eight.png";
import nine from "@/assets/nine.png";

const sessions = [
  {
    id: 1,
    name: "Leadership Development",
    cover: event1,
    description:
      "Develop essential leadership skills and learn how to inspire and motivate others to achieve common goals.",
  },
];

const courses = [
  { focus: "Ice-breaker activities for Interpersonal Exchange", desc: "Discover Networks and Opportunities", image: two },
  { focus: "Finding friends through shared Extra-Curricular Interests", desc: "Discover Networks and Opportunities", image: twelve },
  { focus: "Peer Mentoring and Reflection Groups", desc: "Discover Networks and Opportunities", image: eleven },
  { focus: "Cultivating a Culture of Innovation and Entrepreneurship", desc: "Discover Networks and Opportunities", image: ten },
  { focus: "Introduction to Academic/Professional Networking", desc: "Discover Networks and Opportunities", image: eight },
  { focus: "Ideate Collaborative Projects", desc: "Discover Networks and Opportunities", image: nine },
];

const FindingNemoPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("student");
  const [formData, setFormData] = useState({
    name: "",
    option: "",
    course: "",
    message: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [registeredCourses, setRegisteredCourses] = useState<Set<string>>(new Set());
  const [participants, setParticipants] = useState<any[]>([]);
  const [showParticipants, setShowParticipants] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.emailVerified) {
        setCurrentUser(user);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role || "student");
          setFormData((prev) => ({ ...prev, name: userDoc.data().name || "" }));
        }
      } else {
        setCurrentUser(null);
        setUserRole("student");
      }
    });
    return () => unsubscribe();
  }, []);

  // Load registered courses for current user
  useEffect(() => {
    if (!currentUser) {
      setRegisteredCourses(new Set());
      return;
    }

    const q = query(
      collection(db, "eventRegistrations"),
      where("userId", "==", currentUser.uid),
      where("eventName", "==", "TheIncredibles")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const registered = new Set<string>();
      snapshot.forEach((doc) => {
        registered.add(doc.data().course);
      });
      setRegisteredCourses(registered);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Please log in first to register.");
      navigate("/auth");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "eventRegistrations"), {
        eventName: "TheIncredibles",
        course: selectedCourse,
        userId: currentUser.uid,
        name: formData.name,
        email: currentUser.email,
        option: formData.option,
        message: formData.message,
        timestamp: serverTimestamp(),
      });

      alert("Registration successful!");
      setShowForm(false);
      setFormData({ ...formData, option: "", message: "" });
    } catch (error) {
      alert("Registration failed. Try again.");
    }
    setLoading(false);
  };

  const openRegisterModal = (courseName: string) => {
    if (!currentUser) {
      alert("Please log in first to register.");
      navigate("/auth");
      return;
    }
    setSelectedCourse(courseName);
    setFormData({ ...formData, course: courseName });
    setShowForm(true);
  };

  const openParticipantsModal = async (courseName: string) => {
    setSelectedCourse(courseName);
    setShowParticipants(true);

    const q = query(
      collection(db, "eventRegistrations"),
      where("eventName", "==", "TheIncredibles"),
      where("course", "==", courseName)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const list = await Promise.all(
        snapshot.docs.map(async (d) => {
          const data = d.data();
          // Fetch user profile pic
          let profileUrl = null;
          try {
            const userDoc = await getDoc(doc(db, "users", data.userId));
            if (userDoc.exists()) {
              profileUrl = userDoc.data().profileUrl || null;
            }
          } catch (err) {
            console.error("Failed to fetch profile pic:", err);
          }
          return { ...data, profileUrl };
        })
      );
      setParticipants(list);
    });

    // Cleanup
    return () => unsubscribe();
  };

  return (
    <div className="bg-gray-50">
      {/* Sessions Section */}
      <section className="[background-color:hsl(60,100%,90%)] w-full py-8">
        <section className="[background-color:hsl(60,100%,90%)] w-full ">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8 px-5">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex flex-col md:flex-row items-center md:items-stretch w-full gap-6"
              >
                <div className="flex-1 flex justify-center">
                  <img
                    src={session.cover}
                    alt={session.name}
                    className="w-full h-full object-cover max-w-xs md:max-w-sm"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left gap-4 p-2 max-h-[300px] mt-20">
                  <h2
                    className="text-4xl font-extrabold leading-tight text-pink-600"
                    style={{
                      fontFamily:
                        "'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif",
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    Discover Networks
                    <br />
                    and Opportunities
                  </h2>
                  <h2
                    className="text-4xl font-extrabold leading-tight text-blue-700"
                    style={{
                      fontFamily:
                        "'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif",
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    Explore
                    <br />
                    Discern
                    <br />
                    Collaborate
                  </h2>
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>

      {/* Description Paragraph */}
      <section className="w-full bg-gray-50 pt-2 pb-8 px-6 md:px-12 lg:px-20 [background-color:hsl(60,100%,90%)]">
        <div className="container mx-auto text-center">
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-4xl mx-auto">
            Discover the power of connections as we enable you to forge
            meaningful relationships, expand your professional network, and
            thrive through collaboration. This is where you unlock your
            potential and give it wings! Join us and take your personal and
            academic experience to the next level.
          </p>
        </div>
      </section>

      {/* Courses Grid Section */}
      <section className="w-full bg-gray-50 py-12 px-6 md:px-12 lg:px-20 [background-color:hsl(60,100%,95%)]">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Here are some of the areas we focus on
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, index) => {
              const isRegistered = registeredCourses.has(course.focus);
              const isAdmin = userRole === "admin" || userRole === "admin+";

              return (
                <Card
                  key={index}
                  className="flex flex-col [background-color:hsl(60,100%,95%)] transition-all duration-300 overflow-hidden rounded-2xl cursor-pointer"
                >
                  <img
                    src={course.image}
                    alt={course.focus}
                    className="w-full h-48 object-contain"
                  />
                  <CardContent className="flex flex-col flex-1 p-4">
                    <h3 className="font-semibold text-gray-900 text-base mb-2">
                      {course.focus}
                    </h3>
                    <p className="text-gray-700 text-sm mb-4">{course.desc}</p>
                    <button
                      onClick={() =>
                        isAdmin
                          ? openParticipantsModal(course.focus)
                          : openRegisterModal(course.focus)
                      }
                      disabled={isRegistered && !isAdmin}
                      className={`mt-auto w-full px-4 py-2 rounded-lg transition ${
                        isRegistered && !isAdmin
                          ? "bg-gray-500 text-white cursor-not-allowed"
                          : isAdmin
                          ? "bg-primary text-white hover:bg-blue-900"
                          : "bg-primary text-white hover:bg-blue-900"
                      }`}
                    >
                      {isAdmin
                        ? "View Participants"
                        : isRegistered
                        ? "Registered"
                        : "Register"}
                    </button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Registration Modal */}
      {showForm && currentUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[hsl(60,100%,95%)] p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">
              Register for {selectedCourse}
            </h3>
            <form onSubmit={handleRegister} className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full p-3 border rounded-lg bg-[hsl(60,100%,90%)]"
                required
              />
              {/* <p className="text-sm text-gray-600">
                Email: <strong>{currentUser.email}</strong>
              </p> */}
              <select
                value={formData.option}
                onChange={(e) =>
                  setFormData({ ...formData, option: e.target.value })
                }
                className="w-full p-3 border rounded-lg bg-[hsl(60,100%,90%)]"
                required
              >
                <option value="" disabled>
                  Select an option
                </option>
                <option value="Option 1">Option 1</option>
                <option value="Option 2">Option 2</option>
                <option value="Option 3">Option 3</option>
                <option value="Option 4">Option 4</option>
                <option value="Option 5">Option 5</option>
                <option value="Option 6">Option 6</option>
              </select>
              <textarea
                placeholder="Additional Message (Optional)"
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className="w-full p-3 border rounded-lg bg-[hsl(60,100%,90%)] h-24 resize-none"
              />
              <div className="flex justify-between gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-800 text-white px-6 py-2 rounded-lg hover:bg-green-900 disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "Submit"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Participants Modal (Admin Only) */}
      {showParticipants && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[hsl(60,100%,95%)] p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              Participants: {selectedCourse}
            </h3>
            {participants.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                No participants yet.
              </p>
            ) : (
              <div className="space-y-3">
                {participants.map((p, i) => (
                  <div
                    key={i}
                    className="p-3 bg-white rounded-lg border border-gray-200 flex items-center gap-3"
                  >
                    {/* Profile Picture */}
                    {p.profileUrl ? (
                      <img
                        src={p.profileUrl}
                        alt={p.name}
                        className="w-10 h-10 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-300 border flex items-center justify-center">
                        <span className="text-xs text-gray-600">
                          {p.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{p.name}</p>
                      <p className="text-sm text-gray-600">{p.email}</p>
                      {p.option && (
                        <p className="text-xs text-gray-500 mt-1">
                          Option: {p.option}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowParticipants(false)}
              className="mt-6 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindingNemoPage;