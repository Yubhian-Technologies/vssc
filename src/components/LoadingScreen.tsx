import { motion } from "framer-motion";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-[9999]">
      {/* Simplified single spinning circle */}
      <motion.div
        className="relative w-12 h-12 rounded-full border-4 border-t-[#2196f3] border-b-[#ffeb3b] border-l-transparent border-r-transparent"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.25,
          ease: "linear",
          repeat: Infinity,
        }}
      />

      {/* Loading text */}
      <motion.p
        className="mt-6 text-black-300 font-medium tracking-wide text-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.6, 1] }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      >
        Loading, please wait...
      </motion.p>
    </div>
  );
};

export default LoadingScreen;
