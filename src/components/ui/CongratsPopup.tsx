import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface CongratsPopupProps {
  onClose: () => void;
  message?: string;
}

export default function CongratsPopup({ onClose, message }: CongratsPopupProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: visible ? 1 : 0.8, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl p-6 shadow-xl max-w-md text-center"
      >
        <h2 className="text-2xl font-bold text-green-600">🎉 Congratulations!</h2>
        <p className="mt-3 text-gray-700">
          {message || (
            <>
              You’ve successfully created your account and earned
              <span className="font-semibold text-blue-600"> 10 points</span>.
            </>
          )}
        </p>
        <p className="mt-2 text-sm text-gray-600">
          Play daily games to earn more and climb the leaderboard!
        </p>

        <button
          onClick={onClose}
          className="mt-5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Got it!
        </button>
      </motion.div>
    </div>
  );
}