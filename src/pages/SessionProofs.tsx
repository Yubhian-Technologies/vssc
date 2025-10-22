import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface SessionProofProps {
  collectionName: string;
  sessions: Session; // Correct: session ID as string
}

interface Session {
  id: string;
  proof?: string[];
  isProofValidate?: boolean;
  [key: string]: any;
}

const SessionProof: React.FC<SessionProofProps> = ({ collectionName, sessions}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch the specific session by ID
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const sessionRef = doc(db, collectionName, sessions.id);
        const sessionDoc = await getDoc(sessionRef);

        if (sessionDoc.exists()) {
          const data = sessionDoc.data();
          setSession({
            id: sessionDoc.id,
            proof: data?.proof || [],
            isProofValidate: data?.isProofValidate || false,
            ...data,
          });
        } else {
          toast.error("Session not found.");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch session.");
      }
    };

    fetchSession();
  }, [collectionName, sessions]);

  // Handle validation
  const handleValidate = async () => {
    if (!session) return;

    try {
      const sessionRef = doc(db, collectionName, session.id);
      await updateDoc(sessionRef, { isProofValidate: true });
      toast.success("Proof validated successfully!");
      setSession({ ...session, isProofValidate: true });
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to validate proof.");
    }
  };

  if (!session) return null;

  return (
    <div>
      {/* Single button to open modal */}
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded shadow"
        onClick={() => setIsOpen(true)}
      >
        View & Validate Proofs
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white p-4 rounded shadow max-w-xl w-full overflow-auto"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">Session ID: {session.id}</h3>
                <button
                  className="text-red-500 font-bold"
                  onClick={() => setIsOpen(false)}
                >
                  Close
                </button>
              </div>

              {/* Proof images */}
              {session.proofs && session.proofs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                  {session.proofs.map((img, i) => (
                    <a key={i} href={img} target="_blank" rel="noopener noreferrer">
                      <img
                        src={img}
                        alt={`proof-${i}`}
                        className="w-full rounded cursor-pointer"
                      />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 mb-4">No proof uploaded for this session.</p>
              )}

              {/* Validate button */}
              {!session.isProofValidate ? (
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded"
                  onClick={handleValidate}
                >
                  Validate Proof
                </button>
              ) : (
                <span className="text-green-600 font-bold">Validated ✅</span>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SessionProof;
