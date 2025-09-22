// addTutoringSessions.ts
import { db } from "./src/firebase"; // your firebase config
import { collection, doc, setDoc } from "firebase/firestore";

const sampleTutoringSessions = [
  // Group Sessions
  {
    id: "group1",
    title: "Maths Group Tutoring",
    skills: ["Algebra", "Calculus"],
    description: "A 1-hour math tutoring session for groups.",
    tutorName: "Dr. Anil Kumar",
    colleges: ["Vishnu Institute of Technology", "Other College"],
    isGroup: true,
    slots: 5,
    participants: [],
  },
  {
    id: "group2",
    title: "Computer Science Group Tutoring",
    skills: ["Java", "Data Structures"],
    description: "A 90-minute group session on programming concepts.",
    tutorName: "Prof. Ravi Shankar",
    colleges: ["Aditya Engineering College"],
    isGroup: true,
    slots: 8,
    participants: [],
  },

  // One-to-One Sessions
  {
    id: "oneonone1",
    title: "Physics Doubt Clarification",
    skills: ["Mechanics", "Electrodynamics"],
    description: "1-on-1 physics doubt clarification. 10 minutes per student.",
    tutorName: "Prof. Sita Reddy",
    colleges: ["Vishnu Institute of Technology"],
    isGroup: false,
    totalDuration: 60,
    slotDuration: 10,
    startTime: "09:00",
    bookedSlots: [
      { time: "09:00", booked: false, user: null },
      { time: "09:10", booked: false, user: null },
      { time: "09:20", booked: false, user: null },
      { time: "09:30", booked: false, user: null },
      { time: "09:40", booked: false, user: null },
      { time: "09:50", booked: false, user: null },
    ],
  },
  {
    id: "oneonone2",
    title: "Chemistry One-to-One Tutoring",
    skills: ["Organic Chemistry", "Inorganic Chemistry"],
    description: "Clarify doubts in chemistry topics. 15 minutes per student.",
    tutorName: "Dr. Priya Nair",
    colleges: ["KL University", "Vishnu Institute of Technology"],
    isGroup: false,
    totalDuration: 90,
    slotDuration: 15,
    startTime: "10:00",
    bookedSlots: [
      { time: "10:00", booked: false, user: null },
      { time: "10:15", booked: false, user: null },
      { time: "10:30", booked: false, user: null },
      { time: "10:45", booked: false, user: null },
      { time: "11:00", booked: false, user: null },
      { time: "11:15", booked: false, user: null },
    ],
  },
  {
    id: "oneonone3",
    title: "English Doubt Clarification",
    skills: ["Grammar", "Writing Skills"],
    description: "Improve English skills one-on-one. 20 minutes per student.",
    tutorName: "Prof. Ramesh Kumar",
    colleges: ["Aditya Engineering College"],
    isGroup: false,
    totalDuration: 60,
    slotDuration: 20,
    startTime: "09:30",
    bookedSlots: [
      { time: "09:30", booked: false, user: null },
      { time: "09:50", booked: false, user: null },
      { time: "10:10", booked: false, user: null },
    ],
  },
];

async function addTutoringSessions() {
  const tutoringCollection = collection(db, "tutoring");

  for (const session of sampleTutoringSessions) {
    // If you want Firestore to generate the ID automatically, remove 'id' from session
    const docRef = doc(tutoringCollection, session.id);
    await setDoc(docRef, session);
    console.log(`Added session: ${session.title}`);
  }
}

addTutoringSessions()
  .then(() => console.log("All sessions added successfully!"))
  .catch((err) => console.error("Error adding sessions:", err));
