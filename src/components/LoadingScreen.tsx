import { motion, type Transition } from "framer-motion";
import Logo from "../assets/vssc.png"; // Adjust the path as necessary
import { useEffect, useState } from "react";

const LoadingScreen = () => {
  const [loading, setLoading] = useState(true);

  // Example: automatically hide loading after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null; // hide loading screen when not loading

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center overflow-hidden">
      {/* ✨ Animated gradient background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-amber-300/15 to-yellow-300/15"
          initial={{ scale: 1 }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 10, 0],
          }}
          transition={{ duration: 4, repeat: Infinity } as Transition}
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-yellow-400/15 to-amber-300/15"
          initial={{ scale: 1 }}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, -10, 0],
          }}
          transition={{ duration: 5, repeat: Infinity, delay: 2 } as Transition}
        />
      </div>

      {/* 🌞 Center logo with animation */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.img
          src={Logo}
          alt="Loading..."
          className="w-20 h-20 object-contain"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <p className="mt-4 text-amber-600 font-medium text-lg animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
