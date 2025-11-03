import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface AppointmentToggleProps {
  userId: string;
}

const AppointmentToggleModal: React.FC<AppointmentToggleProps> = ({ userId }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState<string>("");
  const [userData, setUserData] = useState<any>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [nextState, setNextState] = useState<boolean>(false);
  const [hover, setHover] = useState<boolean>(false);

  // Fetch user data and initial skills
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setIsAdmin(data.role === "admin");
          setIsReady(data.readyForAppointments || false);

          // Fetch existing skills from faculty collection if exists
          const facultyDoc = await getDoc(doc(db, "faculty", userId));
          if (facultyDoc.exists()) {
            const facultyData = facultyDoc.data();
            setSkills(facultyData.skills || []);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [userId]);

  // Add skill
  const handleAddSkill = () => {
    const skill = newSkill.trim();
    if (skill && !skills.includes(skill)) {
      const updatedSkills = [...skills, skill];
      setSkills(updatedSkills);
      setNewSkill("");

      // Update Firestore if faculty doc exists
      const updateFirestore = async () => {
        try {
          const facultyRef = doc(db, "faculty", userId);
          const facultyDoc = await getDoc(facultyRef);
          if (facultyDoc.exists()) {
            await updateDoc(facultyRef, { skills: updatedSkills });
            toast.success(`Skill "${skill}" added successfully.`);
          }
        } catch (error) {
          console.error("Error adding skill:", error);
          toast.error("Failed to add skill to database!");
        }
      };
      updateFirestore();
    }
  };

  // Remove skill
  const handleRemoveSkill = async (skillToRemove: string) => {
    const updatedSkills = skills.filter((s) => s !== skillToRemove);
    setSkills(updatedSkills);

    try {
      const facultyRef = doc(db, "faculty", userId);
      const facultyDoc = await getDoc(facultyRef);
      if (facultyDoc.exists()) {
        await updateDoc(facultyRef, { skills: updatedSkills });
        toast.success(`Skill "${skillToRemove}" removed successfully.`);
      }
    } catch (error) {
      console.error("Error removing skill:", error);
      toast.error("Failed to remove skill from database!");
    }
  };

  // Toggle online/offline
  const handleToggle = async () => {
    if (!isAdmin) return;

    const facultyRef = doc(db, "faculty", userId);
    const facultyDoc = await getDoc(facultyRef);

    if (!facultyDoc.exists() && !isReady) {
      setNextState(true);
      setShowModal(true);
      return;
    }

    setNextState(!isReady);
    setShowModal(true);
  };

  // Confirm toggle with Firestore updates
  const confirmToggle = async () => {
    try {
      const facultyRef = doc(db, "faculty", userId);

      if (!skills.length && nextState && !userData?.readyForAppointments) {
        toast.error("Add at least one skill to go online!");
        return;
      }

      if (!userData?.readyForAppointments) {
        await setDoc(facultyRef, {
          college: userData?.college || "Unknown College",
          designation: userData?.designation || "Professor",
          email: userData?.email || "",
          name: userData?.name || "",
          skills,
          isReady: nextState,
        });
      } else {
        await updateDoc(facultyRef, { isReady: nextState });
      }

      await updateDoc(doc(db, "users", userId), { readyForAppointments: nextState });
      setIsReady(nextState);
      setShowModal(false);

      toast.success(
        nextState
          ? "You are now visible to users for appointments!"
          : "You are now offline for appointments."
      );
    } catch (error) {
      console.error(error);
      toast.error("Error updating status!");
    }
  };

  if (loading || !isAdmin) return null;

  // Styles
  const styles: { [key: string]: React.CSSProperties } = {
    toggleWrapper: {
      width: 50,
      height: 25,
      borderRadius: 15,
      background: isReady ? "#4caf50" : "#ccc",
      position: "relative",
      cursor: "pointer",
      marginRight: 0,
      display: "flex",
      alignItems: "center",
      padding: 2,
    },
    switch: {
      width: 22,
      height: 22,
      borderRadius: "50%",
      background: "#fff",
      boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    },
    modal: {
      background: "#fff",
      padding: 30,
      borderRadius: 12,
      width: 400,
      maxWidth: "90%",
      boxShadow: "0 12px 30px rgba(0,0,0,0.3)",
      display: "flex",
      flexDirection: "column",
      gap: 15,
    },
    title: { fontSize: 20, fontWeight: 600 },
    skillsInput: { display: "flex", gap: 10 },
    input: { flex: 1, padding: 10, fontSize: 14, borderRadius: 6, border: "1px solid #ccc" },
    addButton: {
      padding: "8px 14px",
      background: "#4caf50",
      color: "#fff",
      border: "none",
      borderRadius: 6,
      cursor: "pointer",
    },
    skillsList: { display: "flex", flexWrap: "wrap", gap: 8 },
    skillTag: {
      background: "#4caf50",
      color: "#fff",
      padding: "5px 10px",
      borderRadius: 8,
      display: "flex",
      alignItems: "center",
      gap: 5,
    },
    removeSkillBtn: {
      background: "rgba(255,255,255,0.3)",
      border: "none",
      borderRadius: 50,
      width: 18,
      height: 18,
      cursor: "pointer",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontWeight: 700,
    },
    modalButtons: { display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 10 },
    confirmButton: { padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600 },
    confirmBtnYes: { background: "#4caf50", color: "#fff" },
    confirmBtnCancel: { background: "#ccc" },

    // Tooltip
    tooltip: {
  position: "absolute",
  top: 35,
  right: 0, // 👈 anchor tooltip to the right edge of the toggle
  transform: "none", // 👈 remove centering
  background: "#333",
  color: "#fff",
  padding: "8px 12px",
  borderRadius: 8,
  fontSize: 12,
  textAlign: "left",
  whiteSpace: "pre-line",
  width: 200,
  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
  zIndex: 1000,
},
tooltipArrow: {
  position: "absolute",
  top: -6,
  right: 10, // 👈 arrow now aligns to right side
  width: 0,
  height: 0,
  borderLeft: "6px solid transparent",
  borderRight: "6px solid transparent",
  borderBottom: "6px solid #333",
},

  };

  return (
    <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
      {/* Animated Toggle */}
      <motion.div
        style={styles.toggleWrapper}
        onClick={handleToggle}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        layout
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          style={styles.switch}
          layout
          animate={{ x: isReady ? 26 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />

        {/* Tooltip */}
        {hover && (
          <div style={styles.tooltip}>
            <div style={styles.tooltipArrow}></div>
            {isReady
              ? "Click to go offline\n(you won't be visible to students)"
              : "Click to go online\n(visible to students to book appointments)"}
          </div>
        )}
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.6)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 999,
            }}
          >
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              style={styles.modal}
            >
              <div style={styles.title}>
                {nextState
                  ? "Go Online: Add Skills & Confirm"
                  : "Go Offline: Confirm Status"}
              </div>

              {nextState && (
                <>
                  <div style={styles.skillsInput}>
                    <input
                      type="text"
                      placeholder="Enter skill"
                      style={styles.input}
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                    />
                    <button style={styles.addButton} onClick={handleAddSkill}>
                      Add
                    </button>
                  </div>
                  <div style={styles.skillsList}>
                    {skills.map((skill, i) => (
                      <motion.div
                        key={i}
                        style={styles.skillTag}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        {skill}
                        <button
                          style={styles.removeSkillBtn}
                          onClick={() => handleRemoveSkill(skill)}
                        >
                          ×
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}

              <div style={styles.modalButtons}>
                <button
                  style={{ ...styles.confirmButton, ...styles.confirmBtnCancel }}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  style={{ ...styles.confirmButton, ...styles.confirmBtnYes }}
                  onClick={confirmToggle}
                >
                  {nextState ? "Go Online" : "Go Offline"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppointmentToggleModal;
