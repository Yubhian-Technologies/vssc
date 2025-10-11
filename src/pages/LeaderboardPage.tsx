// src/pages/LeaderboardPage.tsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import { db } from "../firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

type User = {
  uid: string;
  name: string;
  points: number;
};

const formatPoints = (points: number) => {
  if (points >= 1000) return (points / 1000).toFixed(1) + "k";
  return points.toString();
};

const LeaderboardPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const { width, height } = useWindowSize();

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("points", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: User[] = snapshot.docs.map((doc) => ({
        uid: doc.id,
        ...(doc.data() as User),
      }));
      setUsers(list);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start py-12 px-4 overflow-hidden bg-black text-white">
      {/* --- Galaxy Background Gradient --- */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950 to-black z-0" />

      {/* --- Animated Stars Layer 1 (slow) --- */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {Array.from({ length: 60 }).map((_, i) => (
          <motion.div
            key={`star1-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full opacity-70"
            initial={{
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              scale: 0.5,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [0.5, 1, 0.5],
              x: [0, (Math.random() - 0.5) * 50],
              y: [0, (Math.random() - 0.5) * 50],
            }}
            transition={{
              duration: 6 + Math.random() * 6,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* --- Animated Stars Layer 2 (faster parallax) --- */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={`star2-${i}`}
            className="absolute w-1.5 h-1.5 bg-purple-200 rounded-full opacity-70"
            initial={{
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              scale: 0.8,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.7, 1.2, 0.7],
              x: [0, (Math.random() - 0.5) * 100],
              y: [0, (Math.random() - 0.5) * 100],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Floating Nebula Glows */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-purple-700/30 rounded-full blur-3xl animate-[spin_60s_linear_infinite]" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-[spin_80s_linear_infinite]" />
      <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-pink-600/20 rounded-full blur-2xl animate-pulse" />

      {/* Confetti for Top 3 celebration */}
      {users.length >= 3 && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={250}
        />
      )}

      {/* --- Title --- */}
      <motion.h1
        className="text-6xl md:text-7xl font-extrabold mb-12 bg-gradient-to-r from-pink-500 via-purple-400 to-indigo-500 bg-clip-text text-transparent z-0 drop-shadow-lg"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        VSSC Leaderboard
      </motion.h1>

      {/* --- Top 3 Podium --- */}
      <div className="relative flex items-end justify-center gap-8 mb-20 z-10">
        {/* 2nd */}
        {users[1] && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center relative"
          >
            <Crown className="text-gray-300 mb-2" size={44} />
            <div className="w-28 h-40 bg-gradient-to-t from-gray-700 to-gray-400 rounded-t-xl flex items-center justify-center shadow-[0_0_25px_rgba(255,255,255,0.5)]">
              <span className="font-bold">{users[1].name || "Legend"}</span>
            </div>
            <span className="mt-2 text-gray-300 font-semibold">
              {formatPoints(users[1].points)}🔥
            </span>
          </motion.div>
        )}

        {/* 1st */}
        {users[0] && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center relative"
          >
            <Crown className="text-yellow-400 mb-2 animate-bounce" size={60} />
            <div className="w-36 h-56 bg-gradient-to-t from-yellow-800 to-yellow-400 rounded-t-xl flex items-center justify-center shadow-[0_0_40px_rgba(255,215,0,0.8)] scale-110">
              <span className="font-bold">{users[0].name || "Grand Master"}</span>
            </div>
            <span className="mt-2 text-yellow-300 font-semibold">
              {formatPoints(users[0].points)}🔥
            </span>
          </motion.div>
        )}

        {/* 3rd */}
        {users[2] && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center relative"
          >
            <Crown className="text-orange-500 mb-2" size={38} />
            <div className="w-28 h-36 bg-gradient-to-t from-orange-800 to-orange-400 rounded-t-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,165,0,0.6)]">
              <span className="font-bold">{users[2].name || "Champion"}</span>
            </div>
            <span className="mt-2 text-orange-400 font-semibold">
              {formatPoints(users[2].points)}🔥
            </span>
          </motion.div>
        )}
      </div>

      {/* --- Rest of Leaderboard --- */}
      <div className="w-full max-w-3xl space-y-4 z-10">
        {users.slice(3).map((user, index) => (
          <motion.div
            key={user.uid}
            className="flex items-center justify-between p-4 rounded-xl bg-white/10 backdrop-blur-md border border-purple-500/30 shadow-lg hover:scale-[1.03] transition-transform"
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex items-center gap-3">
              <span className="text-purple-300 font-bold">#{index + 4}</span>
              <span className="font-semibold">{user.name}</span>
            </div>
            <span className="text-pink-400 font-semibold">
              {formatPoints(user.points)}🔥
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LeaderboardPage;
