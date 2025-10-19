import { motion } from "framer-motion";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-[9999]">
      
      <motion.div
        className="relative w-16 h-16"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.2,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-r-transparent border-b-blue-500 border-l-indigo-500 shadow-lg" />
      </motion.div>

      
      <motion.p
        className="mt-6 text-gray-600 font-medium tracking-wide text-lg"
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
