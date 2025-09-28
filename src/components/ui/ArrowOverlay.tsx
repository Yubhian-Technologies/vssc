import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";

export default function ArrowOverlay({ onClose }: { onClose: () => void }) {
  const [targetPos, setTargetPos] = useState<{ top: number; left: number } | null>(null);

  const updatePosition = () => {
    const el = document.getElementById("points-section");
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetPos({
        top: rect.top + window.scrollY,
        left: rect.left + rect.width / 2,
      });
    }
  };

  useEffect(() => {
    // run after a slight delay to ensure layout is ready
    const timer = setTimeout(updatePosition, 100);

    // recalc on resize/scroll
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, []);

  if (!targetPos) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute"
        style={{
          top: targetPos.top - 20, // arrow above section
          left: targetPos.left - 15,
        }}
      >
        <ArrowUp className="w-12 h-12 text-blue-500 animate-bounce" />
      </motion.div>

      <div className="absolute bottom-10 w-full text-center">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}
